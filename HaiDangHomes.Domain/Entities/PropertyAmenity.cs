using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class PropertyAmenity : EntityBase<Guid>
{
    public Guid PropertyId { get; set; }
    public Guid AmenityId { get; set; }
    
    // Navigation properties
    public virtual Property Property { get; set; } = null!;
    public virtual Amenity Amenity { get; set; } = null!;
}
