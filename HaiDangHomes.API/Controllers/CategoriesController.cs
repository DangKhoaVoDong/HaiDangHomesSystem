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
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll(
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetAllCategoriesQuery(lang));
        return Ok(ApiResponse<List<CategoryDto>>.SuccessResponse(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(
        Guid id,
        [FromQuery] string language = "vi")
    {
        var lang = language.ToLower() == "en" ? SupportedLanguage.En : SupportedLanguage.Vi;
        var result = await _mediator.Send(new GetCategoryByIdQuery(id, lang));

        if (result == null)
            return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));

        return Ok(ApiResponse<CategoryDto>.SuccessResponse(result));
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<List<CategoryAdminDto>>>> GetAdminList()
    {
        var result = await _mediator.Send(new GetAllCategoriesAdminQuery());
        return Ok(ApiResponse<List<CategoryAdminDto>>.SuccessResponse(result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CategoryAdminDto>>> Create([FromBody] CreateAdminCategoryCommand cmd)
    {
        var result = await _mediator.Send(cmd);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<CategoryAdminDto>.ErrorResponse(result.Error ?? "Failed to create category"));
        }
        return Ok(ApiResponse<CategoryAdminDto>.SuccessResponse(result.Value));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CategoryAdminDto>>> Update(Guid id, [FromBody] UpdateAdminCategoryCommand cmd)
    {
        if (id != cmd.Id)
        {
            return BadRequest(ApiResponse<CategoryAdminDto>.ErrorResponse("Id mismatch"));
        }

        var result = await _mediator.Send(cmd);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<CategoryAdminDto>.ErrorResponse(result.Error ?? "Failed to update category"));
        }
        return Ok(ApiResponse<CategoryAdminDto>.SuccessResponse(result.Value));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteAdminCategoryCommand(id));
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse.ErrorResponse(result.Error ?? "Failed to delete category"));
        }
        return Ok(ApiResponse.SuccessResponse("Category deleted"));
    }
}
