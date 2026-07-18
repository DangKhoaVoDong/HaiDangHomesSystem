using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class Category : AuditableEntityBase<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<Property> Properties { get; set; } = new List<Property>();
    public virtual ICollection<CategoryTranslation> Translations { get; set; } = new List<CategoryTranslation>();
}
