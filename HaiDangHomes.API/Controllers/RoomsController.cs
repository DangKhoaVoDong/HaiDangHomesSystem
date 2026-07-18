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
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> GetById(
        Guid id,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetRoomByIdQuery(id, lang));

        if (result == null)
            return NotFound(ApiResponse<RoomDto>.ErrorResponse("Room not found"));

        return Ok(ApiResponse<RoomDto>.SuccessResponse(result));
    }

    [HttpGet("property/{propertyId:guid}")]
    public async Task<ActionResult<ApiResponse<List<RoomListDto>>>> GetByPropertyId(
        Guid propertyId,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetRoomsByPropertyIdQuery(propertyId, lang));
        return Ok(ApiResponse<List<RoomListDto>>.SuccessResponse(result));
    }

    [HttpGet("available")]
    public async Task<ActionResult<ApiResponse<List<RoomListDto>>>> GetAvailable(
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut,
        [FromQuery] int guests,
        [FromQuery] Guid? propertyId = null,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetAvailableRoomsQuery(
            checkIn, checkOut, guests, propertyId, lang));
        return Ok(ApiResponse<List<RoomListDto>>.SuccessResponse(result));
    }

    [HttpGet("check-availability")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckAvailability(
        [FromQuery] Guid roomId,
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut)
    {
        var result = await _mediator.Send(new CheckRoomAvailabilityQuery(roomId, checkIn, checkOut));
        return Ok(ApiResponse<bool>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("management")]
    public async Task<ActionResult<ApiResponse<SearchResult<RoomManagementDto>>>> GetRoomsForManagement(
        [FromQuery] Guid? propertyId = null,
        [FromQuery] RoomOperationalStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetRoomsForManagementQuery(propertyId, status, page, pageSize));
        return Ok(ApiResponse<SearchResult<RoomManagementDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Create([FromBody] CreateRoomRequest request)
    {
        var command = new CreateRoomCommand(
            request.Name,
            request.Description,
            request.PropertyId,
            request.RoomNumber,
            request.Floor,
            request.PricePerNight,
            request.MaxOccupancy,
            request.BedCount,
            request.BathroomCount,
            request.SizeInSqm,
            request.ImageUrls,
            request.AmenityIds);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<RoomDto>.ErrorResponse(result.Error ?? "Failed to create room"));

        return Ok(ApiResponse<RoomDto>.SuccessResponse(result.Value!, "Room created successfully"));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Update(
        Guid id,
        [FromBody] UpdateRoomRequest request)
    {
        var command = new UpdateRoomCommand(
            id,
            request.Name,
            request.Description,
            request.RoomNumber,
            request.Floor,
            request.PricePerNight,
            request.MaxOccupancy,
            request.BedCount,
            request.BathroomCount,
            request.SizeInSqm,
            request.IsActive,
            request.IsAvailable);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<RoomDto>.ErrorResponse(result.Error ?? "Failed to update room"));

        return Ok(ApiResponse<RoomDto>.SuccessResponse(result.Value!, "Room updated successfully"));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteRoomCommand(id));

        if (!result.IsSuccess)
            return BadRequest(ApiResponse.ErrorResponse(result.Error ?? "Failed to delete room"));

        return Ok(ApiResponse.SuccessResponse("Room deleted successfully"));
    }
}
