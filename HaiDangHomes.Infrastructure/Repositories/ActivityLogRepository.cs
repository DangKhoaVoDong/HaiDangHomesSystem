using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HaiDangHomes.Infrastructure.Repositories;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly ApplicationDbContext _context;

    public ActivityLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityLog>> GetLogsAsync(
        int page,
        int pageSize,
        string? entityType = null,
        ActivityLogType? logType = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ActivityLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(l => l.EntityType == entityType);

        if (logType.HasValue)
            query = query.Where(l => l.LogType == logType.Value);

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ActivityLog log, CancellationToken cancellationToken = default)
    {
        await _context.ActivityLogs.AddAsync(log, cancellationToken);
    }
}
