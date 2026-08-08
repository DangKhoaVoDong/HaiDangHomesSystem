using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Interfaces;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

public sealed class GetActivityLogsQueryHandler
    : IRequestHandler<GetActivityLogsQuery, List<ActivityLogDto>>
{
    private readonly IActivityLogRepository _activityLogRepository;

    public GetActivityLogsQueryHandler(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task<List<ActivityLogDto>> Handle(
        GetActivityLogsQuery request,
        CancellationToken cancellationToken)
    {
        var logs = await _activityLogRepository.GetLogsAsync(
            request.ActorUserId,
            request.IsAdmin,
            request.Page,
            request.PageSize,
            request.EntityType,
            request.LogType,
            cancellationToken);

        return logs.Select(log => new ActivityLogDto(
            log.Id,
            log.Action,
            log.EntityType,
            log.EntityId,
            null,
            log.UserId?.ToString(),
            log.UserName,
            log.Details,
            log.OldValue,
            log.NewValue,
            log.LogType,
            log.CreatedAt)).ToList();
    }
}
