namespace HaiDangHomes.Domain.Common;

public abstract class EntityBase<TId> where TId : notnull
{
    public TId Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
