using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class Room : AuditableEntityBase<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid PropertyId { get; set; }
    public int RoomNumber { get; set; }
    public int Floor { get; set; } = 1;
    public decimal PricePerNight { get; set; }
    public int MaxOccupancy { get; set; } = 2;
    public int BedCount { get; set; } = 1;
    public int BathroomCount { get; set; } = 1;
    public int SizeInSqm { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAvailable { get; set; } = true;

    // Operational Status managed by Manager
    public RoomOperationalStatus OperationalStatus { get; set; } = RoomOperationalStatus.Available;
    public string? OperationalNote { get; set; } // Ghi chú khi sửa chữa

    // Navigation properties
    public virtual Property Property { get; set; } = null!;
    public virtual ICollection<RoomImage> Images { get; set; } = new List<RoomImage>();
    public virtual ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
    public virtual ICollection<RoomTranslation> Translations { get; set; } = new List<RoomTranslation>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<RoomAvailability> Availabilities { get; set; } = new List<RoomAvailability>();
}
