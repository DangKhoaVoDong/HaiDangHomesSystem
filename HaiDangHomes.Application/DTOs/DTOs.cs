using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Application.Mappings;
using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Application.DTOs;

// Auth DTOs
public record RegisterRequest(
    string Email,
    string? PhoneNumber,
    string Password,
    string FullName);

public record LoginRequest(
    string Email,
    string Password);

public record SendOtpRequest(
    string Email);

public record VerifyOtpRequest(
    string Email,
    string OtpCode);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User);

public record RefreshTokenRequest(
    string RefreshToken);

public record UserDto(
    Guid Id,
    string Email,
    string? PhoneNumber,
    string FullName,
    string? AvatarUrl,
    UserRole Role,
    bool IsVerified,
    int LoyaltyPoints,
    MembershipTier MembershipTier);

// Property DTOs
public record PropertyDto(
    Guid Id,
    string Name,
    string? Description,
    Guid HostId,
    string HostName,
    Guid CategoryId,
    string CategoryName,
    string Address,
    string? City,
    string? District,
    string? Ward,
    double? Latitude,
    double? Longitude,
    string? ThumbnailUrl,
    bool IsActive,
    bool IsFeatured,
    string? BrandName,
    int TotalRooms,
    List<RoomDto> Rooms,
    List<PropertyImageDto> Images,
    List<AmenityDto> Amenities);

public record PropertyListDto(
    Guid Id,
    string Name,
    string? Description,
    string CategoryName,
    string Address,
    string? City,
    string? ThumbnailUrl,
    bool IsFeatured,
    string? BrandName,
    int TotalRooms,
    decimal? MinPrice);

public record CreatePropertyRequest(
    string Name,
    string? Description,
    Guid CategoryId,
    string Address,
    string? City,
    string? District,
    string? Ward,
    double? Latitude,
    double? Longitude,
    string? ThumbnailUrl,
    bool IsActive,
    bool IsFeatured,
    string? BrandName);

public record UpdatePropertyRequest(
    Guid Id,
    string Name,
    string? Description,
    Guid CategoryId,
    string Address,
    string? City,
    string? District,
    string? Ward,
    double? Latitude,
    double? Longitude,
    string? ThumbnailUrl,
    bool IsActive,
    bool IsFeatured,
    string? BrandName);

// Room DTOs
public record RoomImageDto(
    Guid Id,
    string ImageUrl,
    string? Caption,
    int DisplayOrder,
    bool IsPrimary);

public record RoomDto(
    Guid Id,
    string Name,
    string? Description,
    Guid PropertyId,
    string PropertyName,
    int RoomNumber,
    int Floor,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    bool IsActive,
    bool IsAvailable,
    List<RoomImageDto> Images,
    List<AmenityDto> Amenities);

public record RoomListDto(
    Guid Id,
    string Name,
    Guid PropertyId,
    string PropertyName,
    int RoomNumber,
    decimal PricePerNight,
    int MaxOccupancy,
    bool IsAvailable,
    string? PrimaryImageUrl);

public record CreateRoomRequest(
    string Name,
    string? Description,
    Guid PropertyId,
    int RoomNumber,
    int Floor,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    List<string>? ImageUrls = null,
    List<Guid>? AmenityIds = null);

public record UpdateRoomRequest(
    Guid Id,
    string Name,
    string? Description,
    int RoomNumber,
    int Floor,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    bool IsActive,
    bool IsAvailable);

public record PropertyImageDto(
    Guid Id,
    string ImageUrl,
    string? Caption,
    int DisplayOrder,
    bool IsPrimary);

public record RoomAvailabilityDto(
    Guid RoomId,
    DateTime Date,
    bool IsAvailable);

// Booking DTOs
public record BookingDto(
    Guid Id,
    string BookingCode,
    Guid UserId,
    string UserName,
    string? UserEmail,
    Guid RoomId,
    string RoomName,
    string PropertyName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfGuests,
    decimal OriginalPrice,
    decimal DiscountAmount,
    decimal FinalPrice,
    BookingStatus Status,
    PaymentStatus PaymentStatus,
    string? QrCode,
    DateTime? PaidAt,
    DateTime? CheckedInAt,
    DateTime? CompletedAt,
    string? SpecialRequests);

public record BookingListDto(
    Guid Id,
    string BookingCode,
    string RoomName,
    string PropertyName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    decimal FinalPrice,
    BookingStatus Status);

public record CreateBookingRequest(
    Guid? UserId,
    Guid RoomId,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfGuests,
    string? SpecialRequests,
    // Guest info (for non-registered users)
    string? GuestFullName,
    string? GuestEmail,
    string? GuestPhone,
    string? GuestIdCardNumber,
    string? GuestAddress);

public record UpdateBookingStatusRequest(
    Guid BookingId,
    BookingStatus NewStatus);

// Category DTOs
public record CategoryDto(
    Guid Id,
    string Name,
    string? Description,
    string? IconUrl,
    int DisplayOrder,
    bool IsActive,
    List<CategoryTranslationDto>? Translations);

public record CreateCategoryRequest(
    string Name,
    string? Description,
    string? IconUrl,
    int DisplayOrder);

public record CategoryTranslationDto(
    SupportedLanguage Language,
    string Name,
    string? Description);

// Brand DTOs
public record BrandDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateBrandRequest(string Name, string? Description);
public record UpdateBrandRequest(Guid Id, string Name, string? Description, bool IsActive);

// Admin Category CRUD request (Vi + En translations)
public record CreateAdminCategoryRequest(
    string NameVi,
    string NameEn,
    string? DescriptionVi,
    string? DescriptionEn,
    string? IconUrl,
    int DisplayOrder);

public record UpdateAdminCategoryRequest(
    Guid Id,
    string NameVi,
    string NameEn,
    string? DescriptionVi,
    string? DescriptionEn,
    string? IconUrl,
    int DisplayOrder,
    bool IsActive);

// Admin: full Category DTO (Vi + En translations + audit)
public record CategoryAdminDto(
    Guid Id,
    string NameVi,
    string NameEn,
    string? DescriptionVi,
    string? DescriptionEn,
    string? IconUrl,
    int DisplayOrder,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

// Amenity DTOs
public record AmenityDto(
    Guid Id,
    string Name,
    string? Icon,
    string? Description,
    int DisplayOrder,
    bool IsActive);

public record CreateAmenityRequest(
    string Name,
    string? Icon,
    string? Description,
    int DisplayOrder);

// Payment DTOs
public record PaymentDto(
    Guid Id,
    Guid BookingId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string? PaymentMethod,
    string? TransactionId,
    string? VnpayTransactionId,
    DateTime? PaidAt);

public record PaymentResultDto(
    bool Success,
    string? PaymentUrl,
    string? TransactionId,
    string? ErrorMessage);

// Search DTOs
public record SearchRequest(
    string? SearchTerm,
    Guid? CategoryId,
    DateTime? CheckInDate,
    DateTime? CheckOutDate,
    int? Guests,
    string? City,
    decimal? MinPrice,
    decimal? MaxPrice,
    int Page = 1,
    int PageSize = 20);

public record SearchResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

// Image Upload DTOs
public record ImageUploadRequest(
    string FileName,
    string ContentType,
    long FileSize);

public record ImageUploadResult(
    string ImageUrl,
    string? ThumbnailUrl);

// API Response
public record ApiResponse<T>(
    bool Success,
    string? Message,
    T? Data,
    List<string>? Errors)
{
    public static ApiResponse<T> SuccessResponse(T data, string? message = null) =>
        new(true, message, data, null);

    public static ApiResponse<T> ErrorResponse(string error, List<string>? errors = null) =>
        new(false, error, default, errors ?? new List<string> { error });
}

public record ApiResponse(
    bool Success,
    string? Message,
    List<string>? Errors)
{
    public static ApiResponse SuccessResponse(string? message = null) =>
        new(true, message, null);

    public static ApiResponse ErrorResponse(string error, List<string>? errors = null) =>
        new(false, error, errors ?? new List<string> { error });
}

// ==================== MANAGER DTOs ====================

// Manager Dashboard - Room Statistics
public record RoomStatisticsDto(
    int TotalRooms,
    int AvailableRooms,
    int OccupiedRooms,
    int MaintenanceRooms,
    int CheckOutSoonRooms,
    int BlockedRooms,
    double OccupancyRate);

// Manager Dashboard - Activity Logs
public record ActivityLogDto(
    Guid Id,
    string Action,
    string EntityType,
    Guid EntityId,
    string? EntityName,
    string? UserId,
    string? UserName,
    string? Details,
    string? OldValue,
    string? NewValue,
    ActivityLogType LogType,
    DateTime CreatedAt);

// Manager - Room Management
public record RoomManagementDto(
    Guid Id,
    string Name,
    string? Description,
    Guid PropertyId,
    string PropertyName,
    string BrandName,
    int RoomNumber,
    int Floor,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    bool IsActive,
    bool IsAvailable,
    RoomOperationalStatus OperationalStatus,
    string? OperationalNote,
    List<RoomImageDto> Images,
    List<AmenityDto> Amenities);

public record UpdateRoomOperationalStatusRequest(
    Guid RoomId,
    RoomOperationalStatus NewStatus,
    string? Note);

public record UpdateRoomManagementRequest(
    Guid Id,
    string Name,
    string? Description,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    bool IsActive,
    bool IsAvailable);

// ==================== ADMIN DTOs ====================

// Admin KPIs
public record KpiDashboardDto(
    decimal TotalRevenue,
    decimal TotalRevenueThisMonth,
    decimal RevenueGrowth,
    int TotalBookings,
    int TotalBookingsThisMonth,
    double OccupancyRate,
    double AverageDailyRate,
    decimal RevenuePerAvailableRoom);

// Revenue Analytics
public record RevenueAnalyticsDto(
    List<MonthlyRevenueDto> MonthlyRevenue,
    List<BrandRevenueDto> RevenueByBrand,
    List<RoomPerformanceDto> RoomPerformance);

public record MonthlyRevenueDto(
    int Year,
    int Month,
    decimal Revenue,
    int Bookings,
    double OccupancyRate);

public record BrandRevenueDto(
    string BrandName,
    decimal Revenue,
    int Bookings,
    double Percentage);

public record RoomPerformanceDto(
    Guid RoomId,
    string RoomName,
    string BrandName,
    int TotalNightsBooked,
    decimal TotalRevenue,
    double OccupancyRate,
    PerformanceLevel PerformanceLevel);

public enum PerformanceLevel
{
    Excellent,  // >= 90%
    Good,       // >= 70%
    Fair,       // >= 50%
    Poor        // < 50%
}

// Admin Staff Management
public record StaffListDto(
    Guid Id,
    string Email,
    string? PhoneNumber,
    string FullName,
    string? AvatarUrl,
    UserRole Role,
    bool IsVerified,
    DateTime CreatedAt);

public record UpdateUserRoleRequest(
    Guid UserId,
    UserRole NewRole);

// Admin Reports
public record ReportRequest(
    DateTime StartDate,
    DateTime EndDate,
    Guid? PropertyId,
    Guid? RoomId);

public record ReportExportDto(
    List<BookingReportDto> Bookings,
    List<RoomReportDto> Rooms,
    decimal TotalRevenue,
    int TotalBookings,
    double AverageOccupancy);

// ==================== ADDITIONAL DTOs ====================

public record BookingCalendarDto(
    Guid BookingId,
    string BookingCode,
    Guid RoomId,
    string RoomName,
    string GuestName,
    DateTime CheckIn,
    DateTime CheckOut,
    BookingStatus Status,
    int NumberOfGuests);

public record BookingReportDto(
    string BookingCode,
    string RoomName,
    string PropertyName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfGuests,
    decimal TotalAmount,
    BookingStatus Status);

public record RoomReportDto(
    string RoomName,
    string BrandName,
    int TotalNightsBooked,
    decimal TotalRevenue,
    double OccupancyRate);

public record SystemSettingsDto(
    string SystemName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    bool MaintenanceMode,
    int MaxBookingAdvanceDays,
    int MinBookingDays,
    decimal TaxRate);
