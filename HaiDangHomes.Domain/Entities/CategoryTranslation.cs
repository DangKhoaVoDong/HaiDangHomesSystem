using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class CategoryTranslation : EntityBase<Guid>
{
    public Guid CategoryId { get; set; }
    public SupportedLanguage Language { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation property
    public virtual Category Category { get; set; } = null!;
}
