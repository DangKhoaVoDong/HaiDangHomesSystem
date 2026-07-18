using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class Booking : AuditableEntityBase<Guid>
{
    public string BookingCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int NumberOfGuests { get; set; } = 1;
    public decimal OriginalPrice { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal FinalPrice { get; set; }
    public decimal PointsRedeemed { get; set; } = 0;
    public int PointsEarned { get; set; } = 0;
    public Enums.BookingStatus Status { get; set; } = Enums.BookingStatus.Pending;
    public Enums.PaymentStatus PaymentStatus { get; set; } = Enums.PaymentStatus.Pending;
    public string? QrCode { get; set; }
    public string? PaymentTransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Guest info (for non-registered users)
    public string? GuestFullName { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
    public string? GuestIdCardNumber { get; set; }
    public string? GuestAddress { get; set; }
    
    // Notes
    public string? SpecialRequests { get; set; }
    public string? CancellationReason { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
