using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class RoomAmenity : EntityBase<Guid>
{
    public Guid RoomId { get; set; }
    public Guid AmenityId { get; set; }
    
    // Navigation properties
    public virtual Room Room { get; set; } = null!;
    public virtual Amenity Amenity { get; set; } = null!;
}
