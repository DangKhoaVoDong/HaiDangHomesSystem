using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class Payment : EntityBase<Guid>
{
    public Guid BookingId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? VnpayTransactionId { get; set; }
    public string? VnpayResponseCode { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? FailureReason { get; set; }
    public string? IpAddress { get; set; }
    
    // Navigation property
    public virtual Booking Booking { get; set; } = null!;
}
