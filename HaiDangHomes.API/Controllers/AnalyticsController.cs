using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin")]
public sealed class AnalyticsController : ControllerBase
{
    private static readonly BookingStatus[] RevenueStatuses =
        [BookingStatus.Confirmed, BookingStatus.CheckedIn, BookingStatus.Completed];

    private readonly ApplicationDbContext _db;

    public AnalyticsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<AnalyticsReportResponse>>> Get(
        [FromQuery] int? year,
        [FromQuery] int? month,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var selectedYear = year ?? now.Year;
        var selectedMonth = month ?? now.Month;
        if (selectedYear is < 2000 or > 2100 || selectedMonth is < 1 or > 12)
            return BadRequest(ApiResponse<AnalyticsReportResponse>.ErrorResponse("Invalid reporting month"));

        var periodStart = new DateTime(selectedYear, selectedMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var periodEnd = periodStart.AddMonths(1);
        var trendStart = periodStart.AddMonths(-5);
        var previousStart = periodStart.AddMonths(-1);

        var rooms = await _db.Rooms.AsNoTracking()
            .Where(room => !room.IsDeleted && room.IsActive && !room.Property.IsDeleted && room.Property.IsActive)
            .Include(room => room.Property)
            .ToListAsync(cancellationToken);

        var bookings = await _db.Bookings.AsNoTracking()
            .Where(booking => !booking.IsDeleted && RevenueStatuses.Contains(booking.Status) &&
                              booking.CheckInDate < periodEnd && booking.CheckOutDate > trendStart)
            .ToListAsync(cancellationToken);

        var current = CalculatePeriod(periodStart, periodEnd, rooms, bookings);
        var previous = CalculatePeriod(previousStart, periodStart, rooms, bookings);
        var roomLookup = rooms.ToDictionary(room => room.Id);

        var currentBookings = bookings
            .Where(booking => booking.CheckInDate < periodEnd && booking.CheckOutDate > periodStart)
            .ToList();

        var brandRows = currentBookings
            .Where(booking => roomLookup.ContainsKey(booking.RoomId))
            .GroupBy(booking => NormalizedBrand(roomLookup[booking.RoomId].Property.BrandName))
            .Select(group => new AnalyticsBrandRow(
                group.Key,
                group.Sum(booking => AllocatedRevenue(booking, periodStart, periodEnd)),
                group.Count()))
            .OrderByDescending(row => row.Revenue)
            .ToList();
        var brandTotal = brandRows.Sum(row => row.Revenue);
        brandRows = brandRows.Select(row => row with
        {
            Percentage = brandTotal == 0 ? 0 : Math.Round(row.Revenue / brandTotal * 100, 1)
        }).ToList();

        var days = (periodEnd - periodStart).Days;
        var roomRows = rooms.Select(room =>
        {
            var matches = currentBookings.Where(booking => booking.RoomId == room.Id).ToList();
            var nights = matches.Sum(booking => OverlapNights(booking, periodStart, periodEnd));
            var capacity = Math.Max(1, room.TotalUnits) * days;
            return new AnalyticsRoomRow(
                room.Id,
                room.Name,
                room.Property.Name,
                NormalizedBrand(room.Property.BrandName),
                nights,
                matches.Sum(booking => AllocatedRevenue(booking, periodStart, periodEnd)),
                Math.Round(nights * 100d / capacity, 1));
        }).Where(row => row.NightsBooked > 0)
          .OrderByDescending(row => row.Revenue)
          .ToList();

        var trend = Enumerable.Range(0, 6).Select(index =>
        {
            var start = trendStart.AddMonths(index);
            var end = start.AddMonths(1);
            var result = CalculatePeriod(start, end, rooms, bookings);
            return new AnalyticsMonthlyRow(start.Year, start.Month, result.Revenue, result.Bookings);
        }).ToList();

        var response = new AnalyticsReportResponse(
            selectedYear,
            selectedMonth,
            new AnalyticsKpiResponse(
                current.Revenue,
                Growth(current.Revenue, previous.Revenue),
                current.Occupancy,
                Growth((decimal)current.Occupancy, (decimal)previous.Occupancy),
                current.Adr,
                Growth(current.Adr, previous.Adr),
                current.Bookings,
                Growth(current.Bookings, previous.Bookings)),
            trend,
            brandRows,
            roomRows);

        return Ok(ApiResponse<AnalyticsReportResponse>.SuccessResponse(response));
    }

    private static PeriodResult CalculatePeriod(DateTime start, DateTime end, List<Room> rooms, List<Booking> bookings)
    {
        var matching = bookings.Where(booking => booking.CheckInDate < end && booking.CheckOutDate > start).ToList();
        var nights = matching.Sum(booking => OverlapNights(booking, start, end));
        var revenue = matching.Sum(booking => AllocatedRevenue(booking, start, end));
        var capacity = rooms.Sum(room => Math.Max(1, room.TotalUnits)) * (end - start).Days;
        return new PeriodResult(
            revenue,
            matching.Count,
            capacity == 0 ? 0 : Math.Round(nights * 100d / capacity, 1),
            nights == 0 ? 0 : Math.Round(revenue / nights, 0));
    }

    private static int OverlapNights(Booking booking, DateTime start, DateTime end)
    {
        var overlapStart = booking.CheckInDate > start ? booking.CheckInDate : start;
        var overlapEnd = booking.CheckOutDate < end ? booking.CheckOutDate : end;
        return Math.Max(0, (overlapEnd.Date - overlapStart.Date).Days);
    }

    private static decimal AllocatedRevenue(Booking booking, DateTime start, DateTime end)
    {
        var totalNights = Math.Max(1, (booking.CheckOutDate.Date - booking.CheckInDate.Date).Days);
        return Math.Round(booking.FinalPrice / totalNights * OverlapNights(booking, start, end), 0);
    }

    private static decimal Growth(decimal current, decimal previous) =>
        previous == 0 ? (current == 0 ? 0 : 100) : Math.Round((current - previous) / previous * 100, 1);

    private static string NormalizedBrand(string? brand) =>
        string.IsNullOrWhiteSpace(brand) ? "Chưa có thương hiệu" : brand.Trim();

    private sealed record PeriodResult(decimal Revenue, int Bookings, double Occupancy, decimal Adr);
}

public record AnalyticsReportResponse(
    int Year,
    int Month,
    AnalyticsKpiResponse Kpis,
    List<AnalyticsMonthlyRow> MonthlyRevenue,
    List<AnalyticsBrandRow> RevenueByBrand,
    List<AnalyticsRoomRow> RoomPerformance);

public record AnalyticsKpiResponse(
    decimal Revenue, decimal RevenueGrowth,
    double OccupancyRate, decimal OccupancyGrowth,
    decimal AverageDailyRate, decimal AdrGrowth,
    int TotalBookings, decimal BookingGrowth);

public record AnalyticsMonthlyRow(int Year, int Month, decimal Revenue, int Bookings);
public record AnalyticsBrandRow(string BrandName, decimal Revenue, int Bookings, decimal Percentage = 0);
public record AnalyticsRoomRow(Guid RoomId, string RoomName, string PropertyName, string BrandName,
    int NightsBooked, decimal Revenue, double OccupancyRate);
