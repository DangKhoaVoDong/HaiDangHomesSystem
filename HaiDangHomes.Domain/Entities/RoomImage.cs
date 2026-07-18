using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class RoomImage : EntityBase<Guid>
{
    public Guid RoomId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
    
    // Navigation property
    public virtual Room Room { get; set; } = null!;
}
