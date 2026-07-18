using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BrandDto>>>> GetAll(
        [FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetAllBrandsQuery(includeInactive));
        return Ok(ApiResponse<List<BrandDto>>.SuccessResponse(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetBrandByIdQuery(id));
        if (result == null)
        {
            return NotFound(ApiResponse<BrandDto>.ErrorResponse("Brand not found"));
        }
        return Ok(ApiResponse<BrandDto>.SuccessResponse(result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> Create([FromBody] CreateBrandCommand cmd)
    {
        var result = await _mediator.Send(cmd);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<BrandDto>.ErrorResponse(result.Error ?? "Failed to create brand"));
        }
        return Ok(ApiResponse<BrandDto>.SuccessResponse(result.Value));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> Update(Guid id, [FromBody] UpdateBrandCommand cmd)
    {
        if (id != cmd.Id)
        {
            return BadRequest(ApiResponse<BrandDto>.ErrorResponse("Id mismatch"));
        }

        var result = await _mediator.Send(cmd);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<BrandDto>.ErrorResponse(result.Error ?? "Failed to update brand"));
        }
        return Ok(ApiResponse<BrandDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteBrandCommand(id));
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse.ErrorResponse(result.Error ?? "Failed to delete brand"));
        }
        return Ok(ApiResponse.SuccessResponse("Brand deleted"));
    }
}
