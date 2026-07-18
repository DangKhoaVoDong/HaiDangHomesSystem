using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class PropertyImage : EntityBase<Guid>
{
    public Guid PropertyId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
    
    // Navigation property
    public virtual Property Property { get; set; } = null!;
}
