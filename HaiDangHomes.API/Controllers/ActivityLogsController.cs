using System.Security.Claims;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/activity-logs")]
[Authorize(Roles = "Manager,Admin")]
public sealed class ActivityLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActivityLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ActivityLogDto>>>> GetRecent(
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _mediator.Send(new GetActivityLogsQuery(
            GetCurrentUserId(),
            User.IsInRole("Admin"),
            1,
            pageSize), cancellationToken);

        return Ok(ApiResponse<List<ActivityLogDto>>.SuccessResponse(result));
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }
}
