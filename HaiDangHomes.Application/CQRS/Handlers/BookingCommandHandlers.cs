using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.Services;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.DTOs;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Result<BookingDto>>
{
    private readonly IBookingService _bookingService;
    private readonly IRoomRepository _roomRepository;

    public CreateBookingCommandHandler(IBookingService bookingService, IRoomRepository roomRepository)
    {
        _bookingService = bookingService;
        _roomRepository = roomRepository;
    }

    public async Task<Result<BookingDto>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var result = await _bookingService.CreateBookingAsync(
            request.UserId,
            request.RoomId,
            request.CheckInDate,
            request.CheckOutDate,
            request.NumberOfGuests,
            request.SpecialRequests,
            request.GuestFullName,
            request.GuestEmail,
            request.GuestPhone,
            request.GuestIdCardNumber,
            request.GuestAddress);

        if (!result.Success)
        {
            return Result<BookingDto>.Failure(result.Error ?? "Failed to create booking");
        }

        return Result<BookingDto>.Success(result.Booking!.ToDto());
    }
}

public class UpdateBookingStatusCommandHandler : IRequestHandler<UpdateBookingStatusCommand, Result<BookingDto>>
{
    private readonly IBookingService _bookingService;
    private readonly IBookingRepository _bookingRepository;

    public UpdateBookingStatusCommandHandler(
        IBookingService bookingService,
        IBookingRepository bookingRepository)
    {
        _bookingService = bookingService;
        _bookingRepository = bookingRepository;
    }

    public async Task<Result<BookingDto>> Handle(UpdateBookingStatusCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken);
        if (booking == null)
            return Result<BookingDto>.Failure("Booking not found");
        if (!request.IsAdmin && booking.Room?.Property?.HostId != request.ActorUserId)
            return Result<BookingDto>.Failure("Booking not found");

        var result = await _bookingService.UpdateBookingStatusAsync(
            request.BookingId,
            request.NewStatus,
            request.CancellationReason);

        if (!result.Success)
        {
            return Result<BookingDto>.Failure(result.Error ?? "Failed to update booking status");
        }

        return Result<BookingDto>.Success(result.Booking!.ToDto());
    }
}

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, Result>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IBookingService _bookingService;

    public CancelBookingCommandHandler(
        IBookingRepository bookingRepository,
        IBookingService bookingService)
    {
        _bookingRepository = bookingRepository;
        _bookingService = bookingService;
    }

    public async Task<Result> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken);
        if (booking == null || booking.UserId != request.ActorUserId)
            return Result.Failure("Booking not found");

        var result = await _bookingService.UpdateBookingStatusAsync(
            request.BookingId, BookingStatus.Cancelled, request.Reason);
        return result.Success ? Result.Success() : Result.Failure(result.Error ?? "Cancellation failed");
    }
}

public static class BookingMappingExtensions
{
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
            booking.CheckedInAt,
            booking.CompletedAt,
            booking.SpecialRequests,
            booking.GuestFullName,
            booking.GuestEmail,
            booking.GuestPhone,
            booking.AdminNote);
    }
}
