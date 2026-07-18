using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class RoomAvailability : EntityBase<Guid>
{
    public Guid RoomId { get; set; }
    public DateTime Date { get; set; }
    public bool IsAvailable { get; set; } = true;
    public Guid? BookingId { get; set; }
    
    // Navigation property
    public virtual Room Room { get; set; } = null!;
    public virtual Booking? Booking { get; set; }
}
