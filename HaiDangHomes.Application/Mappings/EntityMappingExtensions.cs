using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.ValueObjects;

namespace HaiDangHomes.Application.Mappings;

public static class EntityMappingExtensions
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.PhoneNumber,
            user.FullName,
            user.AvatarUrl,
            user.Role,
            user.IsVerified,
            user.LoyaltyPoints,
            user.MembershipTier);
    }

    public static PropertyDto ToDto(this Property property, SupportedLanguage language = SupportedLanguage.Vi)
    {
        return new PropertyDto(
            property.Id,
            property.Name,
            property.Description,
            property.HostId,
            property.Host?.FullName ?? "",
            property.CategoryId,
            property.Category?.Name ?? "",
            property.Address,
            property.City,
            property.District,
            property.Ward,
            property.Latitude,
            property.Longitude,
            property.ThumbnailUrl,
            property.IsActive,
            property.IsFeatured,
            property.BrandName,
            property.TotalRooms,
            property.Rooms?.Select(r => r.ToDto(language)).ToList() ?? new List<RoomDto>(),
            property.Images?.Select(i => i.ToDto()).ToList() ?? new List<PropertyImageDto>(),
            property.Amenities?.Select(a => a.Amenity.ToDto(language)).ToList() ?? new List<AmenityDto>());
    }

    public static PropertyListDto ToListDto(this Property property)
    {
        var minPrice = property.Rooms != null && property.Rooms.Count > 0
            ? property.Rooms.Min(r => r.PricePerNight)
            : 0;
        return new PropertyListDto(
            property.Id,
            property.Name,
            property.Description,
            property.Category?.Name ?? "",
            property.Address,
            property.City,
            property.ThumbnailUrl,
            property.IsFeatured,
            property.BrandName,
            property.TotalRooms,
            minPrice);
    }

    public static RoomDto ToDto(this Room room, SupportedLanguage language = SupportedLanguage.Vi)
    {
        return new RoomDto(
            room.Id,
            room.Name,
            room.Description,
            room.PropertyId,
            room.Property?.Name ?? "",
            room.RoomNumber,
            room.Floor,
            room.PricePerNight,
            room.MaxOccupancy,
            room.BedCount,
            room.BathroomCount,
            room.SizeInSqm,
            room.IsActive,
            room.IsAvailable,
            room.Images?.Select(i => i.ToDto()).ToList() ?? new List<RoomImageDto>(),
            room.RoomAmenities?.Select(ra => ra.Amenity.ToDto(language)).ToList() ?? new List<AmenityDto>());
    }

    public static RoomListDto ToListDto(this Room room)
    {
        return new RoomListDto(
            room.Id,
            room.Name,
            room.PropertyId,
            room.Property?.Name ?? "",
            room.RoomNumber,
            room.PricePerNight,
            room.MaxOccupancy,
            room.IsAvailable,
            room.Images?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? room.Images?.FirstOrDefault()?.ImageUrl);
    }

    public static RoomManagementDto ToManagementDto(this Room room)
    {
        var amenityList = room.RoomAmenities != null
            ? room.RoomAmenities
                .Where(ra => ra.Amenity != null)
                .Select(ra => ra.Amenity.ToDto())
                .ToList()
            : new List<AmenityDto>();

        var imageList = room.Images != null
            ? room.Images.Select(i => i.ToDto()).ToList()
            : new List<RoomImageDto>();

        return new RoomManagementDto(
            room.Id,
            room.Name,
            room.Description,
            room.PropertyId,
            room.Property?.Name ?? "",
            room.Property?.BrandName ?? "",
            room.RoomNumber,
            room.Floor,
            room.PricePerNight,
            room.MaxOccupancy,
            room.BedCount,
            room.BathroomCount,
            room.SizeInSqm,
            room.IsActive,
            room.IsAvailable,
            room.OperationalStatus,
            room.OperationalNote,
            imageList,
            amenityList);
    }

    public static BookingDto ToDto(this Booking booking)
    {
        return new BookingDto(
            booking.Id,
            booking.BookingCode,
            booking.UserId,
            booking.User?.FullName ?? booking.GuestFullName ?? "",
            booking.User?.Email ?? booking.GuestEmail,
            booking.RoomId,
            booking.Room?.Name ?? "",
            booking.Room?.Property?.Name ?? "",
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.NumberOfGuests,
            booking.OriginalPrice,
            booking.DiscountAmount,
            booking.FinalPrice,
            booking.Status,
            booking.PaymentStatus,
            booking.QrCode,
            booking.PaidAt,
            booking.CheckedInAt,
            booking.CompletedAt,
            booking.SpecialRequests);
    }

    public static BookingListDto ToListDto(this Booking booking)
    {
        return new BookingListDto(
            booking.Id,
            booking.BookingCode,
            booking.Room?.Name ?? "",
            booking.Room?.Property?.Name ?? "",
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.FinalPrice,
            booking.Status);
    }

    public static CategoryDto ToDto(this Category category, SupportedLanguage language = SupportedLanguage.Vi)
    {
        var translation = category.Translations?.FirstOrDefault(t => t.Language == language);
        return new CategoryDto(
            category.Id,
            translation?.Name ?? category.Name,
            translation?.Description ?? category.Description,
            category.IconUrl,
            category.DisplayOrder,
            category.IsActive,
            category.Translations?.Select(t => t.ToDto()).ToList());
    }

    public static CategoryTranslationDto ToDto(this CategoryTranslation translation)
    {
        return new CategoryTranslationDto(
            translation.Language,
            translation.Name,
            translation.Description);
    }

    public static BrandDto ToDto(this Brand brand)
    {
        return new BrandDto(
            brand.Id,
            brand.Name,
            brand.Description,
            brand.IsActive,
            brand.CreatedAt,
            brand.UpdatedAt);
    }

    public static AmenityDto ToDto(this Amenity amenity, SupportedLanguage language = SupportedLanguage.Vi)
    {
        var translation = amenity.Translations?.FirstOrDefault(t => t.Language == language);
        return new AmenityDto(
            amenity.Id,
            translation?.Name ?? amenity.Name,
            amenity.Icon,
            translation?.Description ?? amenity.Description,
            amenity.DisplayOrder,
            amenity.IsActive);
    }

    public static RoomImageDto ToDto(this RoomImage image)
    {
        return new RoomImageDto(
            image.Id,
            image.ImageUrl,
            image.Caption,
            image.DisplayOrder,
            image.IsPrimary);
    }

    public static PropertyImageDto ToDto(this PropertyImage image)
    {
        return new PropertyImageDto(
            image.Id,
            image.ImageUrl,
            image.Caption,
            image.DisplayOrder,
            image.IsPrimary);
    }
}
