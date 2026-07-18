using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class Amenity : AuditableEntityBase<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
    public virtual ICollection<PropertyAmenity> PropertyAmenities { get; set; } = new List<PropertyAmenity>();
    public virtual ICollection<AmenityTranslation> Translations { get; set; } = new List<AmenityTranslation>();
}
