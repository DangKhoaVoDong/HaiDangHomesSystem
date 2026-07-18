using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Mappings;
using HaiDangHomes.Application.Services;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Application.Common;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        return user?.ToDto();
    }
}

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetCurrentUserQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        return user?.ToDto();
    }
}

public class GetPropertyByIdQueryHandler : IRequestHandler<GetPropertyByIdQuery, PropertyDto?>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetPropertyByIdQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<PropertyDto?> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
    {
        var property = await _propertyRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return property?.ToDto(request.Language);
    }
}

public class GetAllPropertiesQueryHandler : IRequestHandler<GetAllPropertiesQuery, SearchResult<PropertyListDto>>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetAllPropertiesQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<SearchResult<PropertyListDto>> Handle(GetAllPropertiesQuery request, CancellationToken cancellationToken)
    {
        var properties = await _propertyRepository.GetAllAsync(cancellationToken);
        var totalCount = properties.Count();
        var pagedItems = properties
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => p.ToListDto())
            .ToList();

        return new SearchResult<PropertyListDto>(
            pagedItems,
            totalCount,
            request.Page,
            request.PageSize,
            (int)Math.Ceiling(totalCount / (double)request.PageSize));
    }
}

public class GetFeaturedPropertiesQueryHandler : IRequestHandler<GetFeaturedPropertiesQuery, List<PropertyListDto>>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetFeaturedPropertiesQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<List<PropertyListDto>> Handle(GetFeaturedPropertiesQuery request, CancellationToken cancellationToken)
    {
        var properties = await _propertyRepository.GetFeaturedAsync(request.Count, cancellationToken);
        return properties.Select(p => p.ToListDto()).ToList();
    }
}

public class SearchPropertiesQueryHandler : IRequestHandler<SearchPropertiesQuery, SearchResult<PropertyListDto>>
{
    private readonly IPropertyRepository _propertyRepository;

    public SearchPropertiesQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<SearchResult<PropertyListDto>> Handle(SearchPropertiesQuery request, CancellationToken cancellationToken)
    {
        var properties = await _propertyRepository.SearchAsync(
            request.SearchTerm,
            request.CategoryId,
            cancellationToken);

        // Apply additional filters
        var filtered = properties.AsEnumerable();

        if (!string.IsNullOrEmpty(request.City))
        {
            filtered = filtered.Where(p => 
                p.City?.Contains(request.City, StringComparison.OrdinalIgnoreCase) == true);
        }

        if (request.MinPrice.HasValue)
        {
            filtered = filtered.Where(p => 
                p.Rooms != null && p.Rooms.Any(r => r.PricePerNight >= request.MinPrice.Value));
        }

        if (request.MaxPrice.HasValue)
        {
            filtered = filtered.Where(p => 
                p.Rooms != null && p.Rooms.Any(r => r.PricePerNight <= request.MaxPrice.Value));
        }

        var totalCount = filtered.Count();
        var pagedItems = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => p.ToListDto())
            .ToList();

        return new SearchResult<PropertyListDto>(
            pagedItems,
            totalCount,
            request.Page,
            request.PageSize,
            (int)Math.Ceiling(totalCount / (double)request.PageSize));
    }
}

public class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, RoomDto?>
{
    private readonly IRoomRepository _roomRepository;

    public GetRoomByIdQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<RoomDto?> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return room?.ToDto(request.Language);
    }
}

public class GetAvailableRoomsQueryHandler : IRequestHandler<GetAvailableRoomsQuery, List<RoomListDto>>
{
    private readonly IRoomRepository _roomRepository;

    public GetAvailableRoomsQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<List<RoomListDto>> Handle(GetAvailableRoomsQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _roomRepository.GetAvailableRoomsAsync(
            request.CheckIn,
            request.CheckOut,
            request.Guests,
            cancellationToken);

        if (request.PropertyId.HasValue)
        {
            rooms = rooms.Where(r => r.PropertyId == request.PropertyId.Value);
        }

        return rooms.Select(r => r.ToListDto()).ToList();
    }
}

public class CheckRoomAvailabilityQueryHandler : IRequestHandler<CheckRoomAvailabilityQuery, bool>
{
    private readonly IBookingRepository _bookingRepository;

    public CheckRoomAvailabilityQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<bool> Handle(CheckRoomAvailabilityQuery request, CancellationToken cancellationToken)
    {
        return await _bookingRepository.IsRoomAvailableAsync(
            request.RoomId,
            request.CheckIn,
            request.CheckOut,
            cancellationToken);
    }
}

public class GetBookingByCodeQueryHandler : IRequestHandler<GetBookingByCodeQuery, BookingDto?>
{
    private readonly IBookingRepository _bookingRepository;

    public GetBookingByCodeQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<BookingDto?> Handle(GetBookingByCodeQuery request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByCodeAsync(request.BookingCode, cancellationToken);
        return booking?.ToDto();
    }
}

public class GetUserBookingsQueryHandler : IRequestHandler<GetUserBookingsQuery, List<BookingListDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetUserBookingsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<List<BookingListDto>> Handle(GetUserBookingsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.Booking> bookings;

        if (request.Status.HasValue)
        {
            bookings = await _bookingRepository.GetByUserIdAndStatusAsync(
                request.UserId,
                request.Status.Value,
                cancellationToken);
        }
        else
        {
            var allBookings = await _bookingRepository.GetAllAsync(cancellationToken);
            bookings = allBookings.Where(b => b.UserId == request.UserId);
        }

        return bookings.Select(b => b.ToListDto()).ToList();
    }
}

public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, List<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetAllCategoriesQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetActiveAsync(cancellationToken);
        return categories.Select(c => c.ToDto(request.Language)).ToList();
    }
}

public class GetAllAmenitiesQueryHandler : IRequestHandler<GetAllAmenitiesQuery, List<AmenityDto>>
{
    private readonly IAmenityRepository _amenityRepository;

    public GetAllAmenitiesQueryHandler(IAmenityRepository amenityRepository)
    {
        _amenityRepository = amenityRepository;
    }

    public async Task<List<AmenityDto>> Handle(GetAllAmenitiesQuery request, CancellationToken cancellationToken)
    {
        var amenities = await _amenityRepository.GetActiveAsync(cancellationToken);
        return amenities.Select(a => a.ToDto(request.Language)).ToList();
    }
}
