using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Entities;

public class User : AuditableEntityBase<Guid>
{
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsGuest { get; set; } = false;
    public bool IsVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiresAt { get; set; }
    
    // Loyalty points
    public int LoyaltyPoints { get; set; } = 0;
    public MembershipTier MembershipTier { get; set; } = MembershipTier.Regular;
    public DateTime? LastPointsCalculationDate { get; set; }
    
    // Navigation properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
