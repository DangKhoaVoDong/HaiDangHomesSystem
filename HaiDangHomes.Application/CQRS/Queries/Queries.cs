using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Entities;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Queries;

// User Queries
public record GetUserByIdQuery(Guid Id) : IRequest<UserDto?>;

public record GetUserByEmailQuery(string Email) : IRequest<UserDto?>;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserDto?>;

// Property Queries
public record GetPropertyByIdQuery(Guid Id, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<PropertyDto?>;

public record GetPropertyBySlugQuery(string Slug, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<PropertyDto?>;

public record GetAllPropertiesQuery(
    SupportedLanguage Language = SupportedLanguage.Vi,
    int Page = 1,
    int PageSize = 20) : IRequest<SearchResult<PropertyListDto>>;

public record GetFeaturedPropertiesQuery(
    int Count = 10,
    SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<PropertyListDto>>;

public record GetPropertiesByHostQuery(
    Guid HostId,
    SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<PropertyListDto>>;

public record SearchPropertiesQuery(
    string? SearchTerm,
    Guid? CategoryId,
    DateTime? CheckInDate,
    DateTime? CheckOutDate,
    int? Guests,
    string? City,
    decimal? MinPrice,
    decimal? MaxPrice,
    SupportedLanguage Language = SupportedLanguage.Vi,
    int Page = 1,
    int PageSize = 20) : IRequest<SearchResult<PropertyListDto>>;

// Room Queries
public record GetRoomByIdQuery(Guid Id, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<RoomDto?>;

public record GetRoomsByPropertyIdQuery(
    Guid PropertyId,
    SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<RoomListDto>>;

public record GetAvailableRoomsQuery(
    DateTime CheckIn,
    DateTime CheckOut,
    int Guests,
    Guid? PropertyId = null,
    SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<RoomListDto>>;

public record CheckRoomAvailabilityQuery(
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut) : IRequest<bool>;

// Booking Queries
public record GetBookingByIdQuery(Guid Id) : IRequest<BookingDto?>;

public record GetBookingByCodeQuery(string BookingCode) : IRequest<BookingDto?>;

public record GetUserBookingsQuery(
    Guid UserId,
    BookingStatus? Status = null) : IRequest<List<BookingListDto>>;

public record GetAllBookingsQuery(
    int Page = 1,
    int PageSize = 20,
    BookingStatus? Status = null,
    Guid? PropertyId = null) : IRequest<SearchResult<BookingDto>>;

public record GetPropertyBookingsQuery(
    Guid PropertyId,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<List<BookingDto>>;

// Category Queries
public record GetAllCategoriesQuery(SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<CategoryDto>>;

public record GetCategoryByIdQuery(Guid Id, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<CategoryDto?>;

// Admin: Categories with both translations
public record GetAllCategoriesAdminQuery : IRequest<List<CategoryAdminDto>>;

// Brand Queries
public record GetAllBrandsQuery(bool IncludeInactive = false) : IRequest<List<BrandDto>>;
public record GetBrandByIdQuery(Guid Id) : IRequest<BrandDto?>;

// Amenity Queries
public record GetAllAmenitiesQuery(SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<AmenityDto>>;

public record GetAmenityByIdQuery(Guid Id, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<AmenityDto?>;

public record GetRoomAmenitiesQuery(Guid RoomId, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<AmenityDto>>;

public record GetPropertyAmenitiesQuery(Guid PropertyId, SupportedLanguage Language = SupportedLanguage.Vi) : IRequest<List<AmenityDto>>;

// Stats Queries
public record GetHostStatsQuery(Guid HostId) : IRequest<HostStatsDto>;

public record GetAdminStatsQuery : IRequest<AdminStatsDto>;

public record GetUserStatsQuery(Guid UserId) : IRequest<UserStatsDto>;

// Stats DTOs
public record HostStatsDto(
    int TotalProperties,
    int TotalRooms,
    int TotalBookings,
    int PendingBookings,
    decimal TotalRevenue);

public record AdminStatsDto(
    int TotalUsers,
    int TotalProperties,
    int TotalBookings,
    int PendingBookings,
    decimal TotalRevenue,
    int TotalRevenueCompleted);

public record UserStatsDto(
    int TotalBookings,
    int CompletedBookings,
    int LoyaltyPoints,
    MembershipTier MembershipTier,
    decimal TotalSpent);

// ==================== MANAGER QUERIES ====================

public record GetRoomStatisticsQuery : IRequest<RoomStatisticsDto>;

public record GetActivityLogsQuery(
    int Page = 1,
    int PageSize = 50,
    string? EntityType = null,
    ActivityLogType? LogType = null) : IRequest<List<ActivityLogDto>>;

public record GetRoomsForManagementQuery(
    Guid? PropertyId = null,
    RoomOperationalStatus? Status = null,
    int Page = 1,
    int PageSize = 20) : IRequest<SearchResult<RoomManagementDto>>;

public record GetBookingCalendarQuery(
    DateTime StartDate,
    DateTime EndDate,
    Guid? PropertyId = null) : IRequest<List<BookingCalendarDto>>;

// ==================== ADMIN QUERIES ====================

public record GetKpiDashboardQuery(DateTime StartDate, DateTime EndDate) : IRequest<KpiDashboardDto>;

public record GetRevenueAnalyticsQuery(int Months = 6) : IRequest<RevenueAnalyticsDto>;

public record GetAllStaffQuery : IRequest<List<StaffListDto>>;

public record ExportReportQuery(
    DateTime StartDate,
    DateTime EndDate,
    Guid? PropertyId = null,
    Guid? RoomId = null) : IRequest<ReportExportDto?>;

public record GetRoomPerformanceReportQuery(
    DateTime StartDate,
    DateTime EndDate) : IRequest<List<RoomPerformanceDto>>;

public record GetSystemSettingsQuery : IRequest<SystemSettingsDto>;

// Additional DTOs - defined in DTOs.cs
