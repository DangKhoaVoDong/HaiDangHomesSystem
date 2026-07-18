using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Mappings;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

internal static class PropertyBrandHelper
{
    /// <summary>
    /// Validates the brand name against the active Brands table. Returns the
    /// canonical (upper-cased, trimmed) name if the brand exists and is active,
    /// or null otherwise. Used by Create/Update Property command handlers.
    /// </summary>
    public static async Task<string?> NormalizeBrandNameAsync(
        IBrandRepository brandRepository,
        string? input,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;
        var trimmed = input.Trim();
        var brand = await brandRepository.GetByNameAsync(trimmed, cancellationToken);
        return brand != null && brand.IsActive ? brand.Name : null;
    }
}

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<RoomDto>>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IPropertyRepository _propertyRepository;
    private readonly IRoomImageRepository _roomImageRepository;
    private readonly IRoomAmenityRepository _roomAmenityRepository;

    public CreateRoomCommandHandler(
        IRoomRepository roomRepository,
        IPropertyRepository propertyRepository,
        IRoomImageRepository roomImageRepository,
        IRoomAmenityRepository roomAmenityRepository)
    {
        _roomRepository = roomRepository;
        _propertyRepository = propertyRepository;
        _roomImageRepository = roomImageRepository;
        _roomAmenityRepository = roomAmenityRepository;
    }

    public async Task<Result<RoomDto>> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdAsync(request.PropertyId, cancellationToken);
        if (property == null)
        {
            return Result<RoomDto>.Failure("Property not found");
        }

        // Pre-check: detect duplicate (PropertyId, RoomNumber) before hitting DB
        var existingRooms = await _roomRepository.GetByPropertyIdAsync(request.PropertyId, cancellationToken);
        if (existingRooms.Any(r => r.RoomNumber == request.RoomNumber))
        {
            return Result<RoomDto>.Failure(
                $"Số phòng {request.RoomNumber} đã tồn tại trong property này. Vui lòng chọn số phòng khác.");
        }

        var room = new Room
        {
            Id = Guid.NewGuid(),
            PropertyId = request.PropertyId,
            Name = request.Name,
            Description = request.Description,
            RoomNumber = request.RoomNumber,
            Floor = request.Floor,
            PricePerNight = request.PricePerNight,
            MaxOccupancy = request.MaxOccupancy,
            BedCount = request.BedCount,
            BathroomCount = request.BathroomCount,
            SizeInSqm = request.SizeInSqm,
            IsActive = true,
            IsAvailable = true,
            OperationalStatus = RoomOperationalStatus.Available,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            var created = await _roomRepository.AddAsync(room, cancellationToken);

            // Attach images (first one is primary)
            if (request.ImageUrls is { Count: > 0 })
            {
                var images = new List<RoomImage>();
                for (var i = 0; i < request.ImageUrls.Count; i++)
                {
                    var url = request.ImageUrls[i]?.Trim();
                    if (string.IsNullOrEmpty(url)) continue;

                    images.Add(new RoomImage
                    {
                        Id = Guid.NewGuid(),
                        RoomId = created.Id,
                        ImageUrl = url,
                        IsPrimary = i == 0,
                        DisplayOrder = i,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                if (images.Count > 0)
                {
                    await _roomImageRepository.AddRangeAsync(images, cancellationToken);
                }
            }

            // Attach amenities
            if (request.AmenityIds is { Count: > 0 })
            {
                var roomAmenities = request.AmenityIds
                    .Distinct()
                    .Select(amenityId => new RoomAmenity
                    {
                        Id = Guid.NewGuid(),
                        RoomId = created.Id,
                        AmenityId = amenityId,
                        CreatedAt = DateTime.UtcNow
                    })
                    .ToList();
                if (roomAmenities.Count > 0)
                {
                    await _roomAmenityRepository.AddRangeAsync(roomAmenities, cancellationToken);
                }
            }

            // Bump property's TotalRooms
            property.TotalRooms = property.TotalRooms + 1;
            await _propertyRepository.UpdateAsync(property, cancellationToken);

            var withDetails = await _roomRepository.GetByIdWithDetailsAsync(created.Id, cancellationToken);
            return Result<RoomDto>.Success(withDetails!.ToDto());
        }
        catch (Exception ex) when (ex.InnerException?.Message?.Contains("IX_Rooms_PropertyId_RoomNumber") == true
                                    || ex.Message.Contains("IX_Rooms_PropertyId_RoomNumber"))
        {
            return Result<RoomDto>.Failure(
                $"Số phòng {request.RoomNumber} đã tồn tại trong property này. Vui lòng chọn số phòng khác.");
        }
    }
}

public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, Result<RoomDto>>
{
    private readonly IRoomRepository _roomRepository;

    public UpdateRoomCommandHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<Result<RoomDto>> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken);
        if (room == null)
        {
            return Result<RoomDto>.Failure("Room not found");
        }

        room.Name = request.Name;
        room.Description = request.Description;
        room.RoomNumber = request.RoomNumber;
        room.Floor = request.Floor;
        room.PricePerNight = request.PricePerNight;
        room.MaxOccupancy = request.MaxOccupancy;
        room.BedCount = request.BedCount;
        room.BathroomCount = request.BathroomCount;
        room.SizeInSqm = request.SizeInSqm;
        room.IsActive = request.IsActive;
        room.IsAvailable = request.IsAvailable;

        await _roomRepository.UpdateAsync(room, cancellationToken);

        var withDetails = await _roomRepository.GetByIdWithDetailsAsync(room.Id, cancellationToken);
        return Result<RoomDto>.Success(withDetails!.ToDto());
    }
}

public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, Result>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IPropertyRepository _propertyRepository;

    public DeleteRoomCommandHandler(IRoomRepository roomRepository, IPropertyRepository propertyRepository)
    {
        _roomRepository = roomRepository;
        _propertyRepository = propertyRepository;
    }

    public async Task<Result> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken);
        if (room == null)
        {
            return Result.Failure("Room not found");
        }

        await _roomRepository.DeleteAsync(request.Id, cancellationToken);

        var property = await _propertyRepository.GetByIdAsync(room.PropertyId, cancellationToken);
        if (property != null && property.TotalRooms > 0)
        {
            property.TotalRooms -= 1;
            await _propertyRepository.UpdateAsync(property, cancellationToken);
        }

        return Result.Success();
    }
}

public class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, Result<PropertyDto>>
{
    private readonly IPropertyRepository _propertyRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IRoomRepository _roomRepository;

    public CreatePropertyCommandHandler(
        IPropertyRepository propertyRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IRoomRepository roomRepository)
    {
        _propertyRepository = propertyRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _roomRepository = roomRepository;
    }

    public async Task<Result<PropertyDto>> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<PropertyDto>.Failure("Category not found");
        }

        var normalizedBrand = await PropertyBrandHelper.NormalizeBrandNameAsync(
            _brandRepository, request.BrandName, cancellationToken);

        var property = new Property
        {
            Id = Guid.NewGuid(),
            HostId = request.HostId,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            City = request.City,
            District = request.District,
            Ward = request.Ward,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ThumbnailUrl = request.ThumbnailUrl,
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured,
            BrandName = normalizedBrand,
            TotalRooms = 0,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _propertyRepository.AddAsync(property, cancellationToken);

        // Auto-create 1 phòng cho căn hộ để trang Home hiển thị được ngay
        if (IsApartmentCategory(category.Name))
        {
            var defaultRoom = new Room
            {
                Id = Guid.NewGuid(),
                PropertyId = created.Id,
                Name = created.Name,
                RoomNumber = 1,
                Floor = 1,
                PricePerNight = 0,
                MaxOccupancy = 4,
                BedCount = 2,
                BathroomCount = 1,
                SizeInSqm = 50,
                IsActive = true,
                IsAvailable = true,
                OperationalStatus = RoomOperationalStatus.Available,
                CreatedAt = DateTime.UtcNow
            };
            await _roomRepository.AddAsync(defaultRoom, cancellationToken);
            created.TotalRooms = 1;
            await _propertyRepository.UpdateAsync(created, cancellationToken);
        }

        var withDetails = await _propertyRepository.GetByIdWithDetailsAsync(created.Id, cancellationToken);
        return Result<PropertyDto>.Success(withDetails!.ToDto());
    }

    private static bool IsApartmentCategory(string? categoryName)
    {
        if (string.IsNullOrWhiteSpace(categoryName)) return false;
        return System.Text.RegularExpressions.Regex.IsMatch(
            categoryName,
            @"c[aă]n\s*h[oộ]|apartment",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }
}

public class UpdatePropertyCommandHandler : IRequestHandler<UpdatePropertyCommand, Result<PropertyDto>>
{
    private readonly IPropertyRepository _propertyRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;

    public UpdatePropertyCommandHandler(
        IPropertyRepository propertyRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository)
    {
        _propertyRepository = propertyRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
    }

    public async Task<Result<PropertyDto>> Handle(UpdatePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (property == null)
        {
            return Result<PropertyDto>.Failure("Property not found");
        }

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
        {
            return Result<PropertyDto>.Failure("Category not found");
        }

        property.Name = request.Name;
        property.Description = request.Description;
        property.CategoryId = request.CategoryId;
        property.Address = request.Address;
        property.City = request.City;
        property.District = request.District;
        property.Ward = request.Ward;
        property.Latitude = request.Latitude;
        property.Longitude = request.Longitude;
        property.ThumbnailUrl = request.ThumbnailUrl;
        property.IsActive = request.IsActive;
        property.IsFeatured = request.IsFeatured;
        property.BrandName = await PropertyBrandHelper.NormalizeBrandNameAsync(
            _brandRepository, request.BrandName, cancellationToken);

        await _propertyRepository.UpdateAsync(property, cancellationToken);

        var withDetails = await _propertyRepository.GetByIdWithDetailsAsync(property.Id, cancellationToken);
        return Result<PropertyDto>.Success(withDetails!.ToDto());
    }
}

public class DeletePropertyCommandHandler : IRequestHandler<DeletePropertyCommand, Result>
{
    private readonly IPropertyRepository _propertyRepository;

    public DeletePropertyCommandHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<Result> Handle(DeletePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (property == null)
        {
            return Result.Failure("Property not found");
        }

        try
        {
            await _propertyRepository.DeleteAsync(request.Id, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }

        return Result.Success();
    }
}