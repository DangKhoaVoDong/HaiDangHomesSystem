using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Commands;

// Auth Commands
public record RegisterCommand(
    string Email,
    string? PhoneNumber,
    string Password,
    string FullName) : IRequest<Result<AuthResponse>>;

public record LoginCommand(
    string Email,
    string Password) : IRequest<Result<AuthResponse>>;

public record SendOtpCommand(
    string Email) : IRequest<Result>;

public record VerifyOtpCommand(
    string Email,
    string OtpCode) : IRequest<Result<AuthResponse>>;

public record RefreshTokenCommand(
    string RefreshToken) : IRequest<Result<AuthResponse>>;

public record LogoutCommand(
    string RefreshToken) : IRequest<Result>;

// Property Commands
public record CreatePropertyCommand(
    string Name,
    string? Description,
    Guid HostId,
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
    string? BrandName) : IRequest<Result<PropertyDto>>;

public record UpdatePropertyCommand(
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
    string? BrandName) : IRequest<Result<PropertyDto>>;

public record DeletePropertyCommand(
    Guid Id) : IRequest<Result>;

// Room Commands
public record CreateRoomCommand(
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
    List<Guid>? AmenityIds = null) : IRequest<Result<RoomDto>>;

public record UpdateRoomCommand(
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
    bool IsAvailable) : IRequest<Result<RoomDto>>;

public record DeleteRoomCommand(
    Guid Id) : IRequest<Result>;

// Booking Commands
public record CreateBookingCommand(
    Guid? UserId,
    Guid RoomId,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfGuests,
    string? SpecialRequests,
    string? GuestFullName,
    string? GuestEmail,
    string? GuestPhone,
    string? GuestIdCardNumber,
    string? GuestAddress) : IRequest<Result<BookingDto>>;

public record UpdateBookingStatusCommand(
    Guid BookingId,
    BookingStatus NewStatus,
    string? CancellationReason) : IRequest<Result<BookingDto>>;

public record CancelBookingCommand(
    Guid BookingId,
    string Reason) : IRequest<Result>;

// Category Commands
public record CreateCategoryCommand(
    string Name,
    string? Description,
    string? IconUrl,
    int DisplayOrder,
    List<CategoryTranslationInput>? Translations) : IRequest<Result<CategoryDto>>;

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description,
    string? IconUrl,
    int DisplayOrder,
    bool IsActive,
    List<CategoryTranslationInput>? Translations) : IRequest<Result<CategoryDto>>;

public record DeleteCategoryCommand(
    Guid Id) : IRequest<Result>;

// Admin Category CRUD (handles Vi + En translations via Category admin DTO)
public record CreateAdminCategoryCommand(
    string NameVi,
    string NameEn,
    string? DescriptionVi,
    string? DescriptionEn,
    string? IconUrl,
    int DisplayOrder) : IRequest<Result<CategoryAdminDto>>;

public record UpdateAdminCategoryCommand(
    Guid Id,
    string NameVi,
    string NameEn,
    string? DescriptionVi,
    string? DescriptionEn,
    string? IconUrl,
    int DisplayOrder,
    bool IsActive) : IRequest<Result<CategoryAdminDto>>;

public record DeleteAdminCategoryCommand(Guid Id) : IRequest<Result>;

// Brand Commands
public record CreateBrandCommand(string Name, string? Description) : IRequest<Result<BrandDto>>;

public record UpdateBrandCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive) : IRequest<Result<BrandDto>>;

public record DeleteBrandCommand(Guid Id) : IRequest<Result>;

// Amenity Commands
public record CreateAmenityCommand(
    string Name,
    string? Icon,
    string? Description,
    int DisplayOrder) : IRequest<Result<AmenityDto>>;

public record UpdateAmenityCommand(
    Guid Id,
    string Name,
    string? Icon,
    string? Description,
    int DisplayOrder,
    bool IsActive) : IRequest<Result<AmenityDto>>;

public record DeleteAmenityCommand(
    Guid Id) : IRequest<Result>;

// Image Commands
public record UploadImageCommand(
    string EntityType,
    Guid EntityId,
    string FileName,
    string ContentType,
    byte[] FileData,
    bool IsPrimary = false,
    int DisplayOrder = 0) : IRequest<Result<ImageUploadResult>>;

public record DeleteImageCommand(
    Guid ImageId) : IRequest<Result>;

// User Commands
public record UpdateUserProfileCommand(
    Guid UserId,
    string? FullName,
    string? AvatarUrl) : IRequest<Result<UserDto>>;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword) : IRequest<Result>;

public record ForgotPasswordCommand(
    string Email) : IRequest<Result>;

public record ResetPasswordCommand(
    string ResetCode,
    string NewPassword) : IRequest<Result>;

// Translation
public record CategoryTranslationInput(
    SupportedLanguage Language,
    string Name,
    string? Description);

// ==================== MANAGER COMMANDS ====================

public record UpdateRoomOperationalStatusCommand(
    Guid RoomId,
    RoomOperationalStatus NewStatus,
    string? Note) : IRequest<RoomManagementDto?>;

public record UpdateRoomManagementCommand(
    Guid Id,
    string Name,
    string? Description,
    decimal PricePerNight,
    int MaxOccupancy,
    int BedCount,
    int BathroomCount,
    int SizeInSqm,
    bool IsActive,
    bool IsAvailable) : IRequest<RoomManagementDto?>;

public record ToggleRoomVisibilityCommand(
    Guid RoomId,
    bool IsVisible) : IRequest<RoomManagementDto?>;

public record CreateActivityLogCommand(
    string Action,
    string EntityType,
    Guid EntityId,
    string? EntityName,
    string? Details,
    string? OldValue,
    string? NewValue,
    ActivityLogType LogType) : IRequest;

// ==================== ADMIN COMMANDS ====================

public record UpdateUserRoleCommand(
    Guid UserId,
    UserRole NewRole) : IRequest<StaffListDto?>;
