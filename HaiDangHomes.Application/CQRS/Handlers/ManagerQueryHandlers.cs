using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Mappings;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

public class GetRoomsByPropertyIdQueryHandler : IRequestHandler<GetRoomsByPropertyIdQuery, List<RoomListDto>>
{
    private readonly IRoomRepository _roomRepository;

    public GetRoomsByPropertyIdQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<List<RoomListDto>> Handle(GetRoomsByPropertyIdQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _roomRepository.GetByPropertyIdAsync(request.PropertyId, cancellationToken);
        return rooms.Select(r => r.ToListDto()).ToList();
    }
}

public class GetAllBookingsQueryHandler : IRequestHandler<GetAllBookingsQuery, SearchResult<BookingDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetAllBookingsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<SearchResult<BookingDto>> Handle(GetAllBookingsQuery request, CancellationToken cancellationToken)
    {
        var all = await _bookingRepository.GetAllAsync(cancellationToken);
        var query = all.AsEnumerable();

        if (request.Status.HasValue)
        {
            query = query.Where(b => b.Status == request.Status.Value);
        }

        if (request.PropertyId.HasValue)
        {
            query = query.Where(b => b.Room != null && b.Room.PropertyId == request.PropertyId.Value);
        }

        var totalCount = query.Count();
        var items = query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => b.ToDto())
            .ToList();

        return new SearchResult<BookingDto>(
            items,
            totalCount,
            request.Page,
            request.PageSize,
            (int)Math.Ceiling(totalCount / (double)request.PageSize));
    }
}

public class GetPropertyBookingsQueryHandler : IRequestHandler<GetPropertyBookingsQuery, List<BookingDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetPropertyBookingsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<List<BookingDto>> Handle(GetPropertyBookingsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _bookingRepository.GetBookingsByPropertyAsync(request.PropertyId, cancellationToken);

        if (request.FromDate.HasValue)
        {
            bookings = bookings.Where(b => b.CheckInDate >= request.FromDate.Value).ToList();
        }
        if (request.ToDate.HasValue)
        {
            bookings = bookings.Where(b => b.CheckOutDate <= request.ToDate.Value).ToList();
        }

        return bookings.Select(b => b.ToDto()).ToList();
    }
}

public class GetBookingCalendarQueryHandler : IRequestHandler<GetBookingCalendarQuery, List<BookingCalendarDto>>
{
    private readonly IBookingRepository _bookingRepository;

    public GetBookingCalendarQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<List<BookingCalendarDto>> Handle(GetBookingCalendarQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _bookingRepository.GetBookingsForCalendarAsync(
            request.StartDate,
            request.EndDate,
            request.PropertyId,
            cancellationToken);

        return bookings.Select(b => new BookingCalendarDto(
            b.Id,
            b.BookingCode,
            b.RoomId,
            b.Room?.Name ?? "",
            b.User?.FullName ?? b.GuestFullName ?? "",
            b.CheckInDate,
            b.CheckOutDate,
            b.Status,
            b.NumberOfGuests
        )).ToList();
    }
}

public class GetPropertiesByHostQueryHandler : IRequestHandler<GetPropertiesByHostQuery, List<PropertyListDto>>
{
    private readonly IPropertyRepository _propertyRepository;

    public GetPropertiesByHostQueryHandler(IPropertyRepository propertyRepository)
    {
        _propertyRepository = propertyRepository;
    }

    public async Task<List<PropertyListDto>> Handle(GetPropertiesByHostQuery request, CancellationToken cancellationToken)
    {
        var properties = await _propertyRepository.GetByHostIdAsync(request.HostId, cancellationToken);
        return properties.Select(p => p.ToListDto()).ToList();
    }
}

public class GetRoomsForManagementQueryHandler : IRequestHandler<GetRoomsForManagementQuery, SearchResult<RoomManagementDto>>
{
    private readonly IRoomRepository _roomRepository;

    public GetRoomsForManagementQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<SearchResult<RoomManagementDto>> Handle(GetRoomsForManagementQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _roomRepository.GetRoomsForManagementAsync(
            request.PropertyId,
            request.Status,
            request.Page,
            request.PageSize,
            cancellationToken);

        var totalCount = await _roomRepository.GetTotalCountForManagementAsync(
            request.PropertyId,
            request.Status,
            cancellationToken);

        var items = rooms.Select(r => r.ToManagementDto()).ToList();

        return new SearchResult<RoomManagementDto>(
            items,
            totalCount,
            request.Page,
            request.PageSize,
            (int)Math.Ceiling(totalCount / (double)request.PageSize));
    }
}