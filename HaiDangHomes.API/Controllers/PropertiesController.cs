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
public class PropertiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropertiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<SearchResult<PropertyListDto>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetAllPropertiesQuery(lang, page, pageSize));
        return Ok(ApiResponse<SearchResult<PropertyListDto>>.SuccessResponse(result));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<PropertyListDto>>>> GetFeatured(
        [FromQuery] int count = 10,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetFeaturedPropertiesQuery(count, lang));
        return Ok(ApiResponse<List<PropertyListDto>>.SuccessResponse(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PropertyDto>>> GetById(
        Guid id,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetPropertyByIdQuery(id, lang));

        if (result == null)
            return NotFound(ApiResponse<PropertyDto>.ErrorResponse("Property not found"));

        return Ok(ApiResponse<PropertyDto>.SuccessResponse(result));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<SearchResult<PropertyListDto>>>> Search(
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? categoryId,
        [FromQuery] DateTime? checkInDate,
        [FromQuery] DateTime? checkOutDate,
        [FromQuery] int? guests,
        [FromQuery] string? city,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new SearchPropertiesQuery(
            searchTerm, categoryId, checkInDate, checkOutDate, guests,
            city, minPrice, maxPrice, lang, page, pageSize));

        return Ok(ApiResponse<SearchResult<PropertyListDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpGet("my-properties")]
    public async Task<ActionResult<ApiResponse<List<PropertyListDto>>>> GetMyProperties(
        [FromQuery] string language = "vi")
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetPropertiesByHostQuery(Guid.Parse(userId), lang));
        return Ok(ApiResponse<List<PropertyListDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<PropertyDto>>> Create([FromBody] CreatePropertyRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreatePropertyCommand(
            request.Name,
            request.Description,
            Guid.Parse(userId),
            request.CategoryId,
            request.Address,
            request.City,
            request.District,
            request.Ward,
            request.Latitude,
            request.Longitude,
            request.ThumbnailUrl,
            request.IsActive,
            request.IsFeatured,
            request.BrandName);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<PropertyDto>.ErrorResponse(result.Error ?? "Failed to create property"));

        return Ok(ApiResponse<PropertyDto>.SuccessResponse(result.Value!, "Property created successfully"));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PropertyDto>>> Update(
        Guid id,
        [FromBody] UpdatePropertyRequest request)
    {
        var command = new UpdatePropertyCommand(
            id,
            request.Name,
            request.Description,
            request.CategoryId,
            request.Address,
            request.City,
            request.District,
            request.Ward,
            request.Latitude,
            request.Longitude,
            request.ThumbnailUrl,
            request.IsActive,
            request.IsFeatured,
            request.BrandName);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<PropertyDto>.ErrorResponse(result.Error ?? "Failed to update property"));

        return Ok(ApiResponse<PropertyDto>.SuccessResponse(result.Value!, "Property updated successfully"));
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePropertyCommand(id));

        if (!result.IsSuccess)
            return BadRequest(ApiResponse.ErrorResponse(result.Error ?? "Failed to delete property"));

        return Ok(ApiResponse.SuccessResponse("Property deleted successfully"));
    }
}
