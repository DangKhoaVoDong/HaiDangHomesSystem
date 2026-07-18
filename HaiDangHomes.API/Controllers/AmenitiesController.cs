using MediatR;
using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmenitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AmenitiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AmenityDto>>>> GetAll(
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetAllAmenitiesQuery(lang));
        return Ok(ApiResponse<List<AmenityDto>>.SuccessResponse(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AmenityDto>>> GetById(
        Guid id,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetAmenityByIdQuery(id, lang));

        if (result == null)
            return NotFound(ApiResponse<AmenityDto>.ErrorResponse("Amenity not found"));

        return Ok(ApiResponse<AmenityDto>.SuccessResponse(result));
    }
}
