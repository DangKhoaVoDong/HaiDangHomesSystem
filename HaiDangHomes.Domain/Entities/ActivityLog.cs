using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class ActivityLog : AuditableEntityBase<Guid>
{
    public string Action { get; set; } = string.Empty; // Created, Updated, Deleted, StatusChanged
    public string EntityType { get; set; } = string.Empty; // Room, Booking, Property, User
    public Guid EntityId { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Details { get; set; } // JSON details of the change
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public ActivityLogType LogType { get; set; } = ActivityLogType.Info;
    public DateTime? ExpiresAt { get; set; }

    // Navigation
    public virtual User? User { get; set; }
}

public enum ActivityLogType
{
    Info = 1,
    Warning = 2,
    Success = 3,
    Error = 4,
    Booking = 5,
    RoomStatus = 6
}
