using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class PropertyTranslation : EntityBase<Guid>
{
    public Guid PropertyId { get; set; }
    public SupportedLanguage Language { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation property
    public virtual Property Property { get; set; } = null!;
}
