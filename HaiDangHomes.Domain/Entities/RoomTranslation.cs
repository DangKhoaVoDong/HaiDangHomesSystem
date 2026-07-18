using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class RoomTranslation : EntityBase<Guid>
{
    public Guid RoomId { get; set; }
    public SupportedLanguage Language { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation property
    public virtual Room Room { get; set; } = null!;
}
