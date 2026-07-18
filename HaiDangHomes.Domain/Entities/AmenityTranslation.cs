using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class AmenityTranslation : EntityBase<Guid>
{
    public Guid AmenityId { get; set; }
    public SupportedLanguage Language { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation property
    public virtual Amenity Amenity { get; set; } = null!;
}
