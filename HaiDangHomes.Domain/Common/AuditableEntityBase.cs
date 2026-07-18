namespace HaiDangHomes.Domain.Common;

public abstract class AuditableEntityBase<TId> : EntityBase<TId> where TId : notnull
{
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}
