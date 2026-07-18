using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;

    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .Include(b => b.Payments)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Booking?> GetByCodeAsync(string bookingCode, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .FirstOrDefaultAsync(b => b.BookingCode == bookingCode, cancellationToken);
    }

    public async Task<Booking?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Booking?> GetByPaymentTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .FirstOrDefaultAsync(b => b.PaymentTransactionId == transactionId, cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Where(b => b.RoomId == roomId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .Where(b => b.CheckInDate >= from && b.CheckInDate <= to)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Booking>> GetByUserIdAndStatusAsync(Guid userId, Domain.Enums.BookingStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .Where(b => b.UserId == userId && b.Status == status)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Booking> AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await _context.Bookings.AddAsync(booking, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return booking;
    }

    public async Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        booking.UpdatedAt = DateTime.UtcNow;
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var booking = await GetByIdAsync(id, cancellationToken);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> IsRoomAvailableAsync(Guid roomId, DateTime checkIn, DateTime checkOut, CancellationToken cancellationToken = default)
    {
        var overlappingBookings = await _context.Bookings
            .Where(b => b.RoomId == roomId &&
                b.Status != Domain.Enums.BookingStatus.Cancelled &&
                b.Status != Domain.Enums.BookingStatus.Refunded &&
                b.CheckInDate < checkOut &&
                b.CheckOutDate > checkIn)
            .AnyAsync(cancellationToken);

        return !overlappingBookings;
    }

    public async Task<List<Booking>> GetBookingsInRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Property)
            .Where(b => b.CreatedAt >= startDate && b.CreatedAt <= endDate)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Booking>> GetBookingsForCalendarAsync(
        DateTime startDate,
        DateTime endDate,
        Guid? propertyId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Where(b =>
                b.CheckInDate >= startDate &&
                b.CheckInDate <= endDate &&
                b.Status != Domain.Enums.BookingStatus.Cancelled &&
                b.Status != Domain.Enums.BookingStatus.Refunded);

        if (propertyId.HasValue)
            query = query.Where(b => b.Room!.PropertyId == propertyId.Value);

        return await query
            .OrderBy(b => b.CheckInDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Booking>> GetBookingsByPropertyAsync(
        Guid propertyId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Room!.PropertyId == propertyId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Booking>> GetBookingsByRoomAsync(
        Guid roomId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Where(b => b.RoomId == roomId)
            .ToListAsync(cancellationToken);
    }
}
