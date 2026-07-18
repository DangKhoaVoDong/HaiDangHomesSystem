using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Interfaces;

public interface IActivityLogRepository
{
    Task<List<ActivityLog>> GetLogsAsync(
        int page,
        int pageSize,
        string? entityType = null,
        ActivityLogType? logType = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(ActivityLog log, CancellationToken cancellationToken = default);
}
