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

    public UpdateBookingStatusCommandHandler(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    public async Task<Result<BookingDto>> Handle(UpdateBookingStatusCommand request, CancellationToken cancellationToken)
    {
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
            booking.PaymentStatus,
            booking.QrCode,
            booking.PaidAt,
            booking.CheckedInAt,
            booking.CompletedAt,
            booking.SpecialRequests);
    }
}
