using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{bookingCode}")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetByCode(string bookingCode)
    {
        var result = await _mediator.Send(new GetBookingByCodeQuery(bookingCode));

        if (result == null)
            return NotFound(ApiResponse<BookingDto>.ErrorResponse("Booking not found"));

        return Ok(ApiResponse<BookingDto>.SuccessResponse(result));
    }

    [Authorize]
    [HttpGet("my-bookings")]
    public async Task<ActionResult<ApiResponse<List<BookingListDto>>>> GetMyBookings(
        [FromQuery] int? status = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        BookingStatus? bookingStatus = status.HasValue
            ? (BookingStatus)status.Value
            : null;

        var result = await _mediator.Send(new GetUserBookingsQuery(
            Guid.Parse(userId), bookingStatus));

        return Ok(ApiResponse<List<BookingListDto>>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDto>>> Create([FromBody] CreateBookingRequest request)
    {
        // Validate guest info for non-logged-in users
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            if (string.IsNullOrWhiteSpace(request.GuestFullName))
                return BadRequest(ApiResponse<BookingDto>.ErrorResponse("Full name is required for guest booking"));
            if (string.IsNullOrWhiteSpace(request.GuestEmail))
                return BadRequest(ApiResponse<BookingDto>.ErrorResponse("Email is required for guest booking"));
            if (string.IsNullOrWhiteSpace(request.GuestPhone))
                return BadRequest(ApiResponse<BookingDto>.ErrorResponse("Phone number is required for guest booking"));

            // Validate email format
            if (!IsValidEmail(request.GuestEmail))
                return BadRequest(ApiResponse<BookingDto>.ErrorResponse("Invalid email format"));
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Guid? parsedUserId = null;
        if (!string.IsNullOrEmpty(userId))
        {
            parsedUserId = Guid.Parse(userId);
        }

        var command = new CreateBookingCommand(
            parsedUserId,
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

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Error ?? "Booking failed"));

        return Ok(ApiResponse<BookingDto>.SuccessResponse(result.Value!, "Booking created successfully"));
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPut("{bookingId}/status")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> UpdateStatus(
        Guid bookingId,
        [FromBody] UpdateBookingStatusRequest request)
    {
        var command = new UpdateBookingStatusCommand(
            bookingId,
            request.NewStatus,
            null);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Error ?? "Update failed"));

        return Ok(ApiResponse<BookingDto>.SuccessResponse(result.Value!, "Booking status updated"));
    }

    [Authorize]
    [HttpPost("{bookingId}/cancel")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> Cancel(
        Guid bookingId,
        [FromBody] CancelBookingRequest request)
    {
        var command = new CancelBookingCommand(bookingId, request.Reason);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<BookingDto>.ErrorResponse(result.Error ?? "Cancellation failed"));

        return Ok(ApiResponse<BookingDto>.SuccessResponse(null, "Booking cancelled"));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<SearchResult<BookingDto>>>> GetAllBookings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? status = null,
        [FromQuery] Guid? propertyId = null)
    {
        BookingStatus? bookingStatus = status.HasValue ? (BookingStatus)status.Value : null;

        var result = await _mediator.Send(new GetAllBookingsQuery(
            page, pageSize, bookingStatus, propertyId));

        return Ok(ApiResponse<SearchResult<BookingDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("calendar")]
    public async Task<ActionResult<ApiResponse<List<BookingCalendarDto>>>> GetCalendar(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] Guid? propertyId = null)
    {
        var result = await _mediator.Send(new GetBookingCalendarQuery(
            startDate, endDate, propertyId));

        return Ok(ApiResponse<List<BookingCalendarDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("property/{propertyId:guid}")]
    public async Task<ActionResult<ApiResponse<List<BookingDto>>>> GetPropertyBookings(
        Guid propertyId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _mediator.Send(new GetPropertyBookingsQuery(
            propertyId, fromDate, toDate));

        return Ok(ApiResponse<List<BookingDto>>.SuccessResponse(result));
    }
}

public record CancelBookingRequest(string Reason);
