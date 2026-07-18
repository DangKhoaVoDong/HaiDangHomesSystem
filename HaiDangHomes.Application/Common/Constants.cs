using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Application.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public abstract class AuditableEntity : BaseEntity
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public string? DeletedBy { get; set; }
}

public static class MembershipConstants
{
    // Points required for each tier
    public static readonly int SilverMinPoints = 100;
    public static readonly int GoldMinPoints = 500;
    public static readonly int DiamondMinPoints = 1000;
    
    // Discount percentage for each tier
    public static readonly decimal RegularDiscount = 0m;
    public static readonly decimal SilverDiscount = 0.05m;  // 5%
    public static readonly decimal GoldDiscount = 0.10m;    // 10%
    public static readonly decimal DiamondDiscount = 0.15m; // 15%
    
    // Points calculation
    public static readonly decimal PointsPerVnd = 0.0001m; // 1 point per 10,000 VND
    
    public static MembershipTier CalculateTier(int points)
    {
        if (points >= DiamondMinPoints) return MembershipTier.Diamond;
        if (points >= GoldMinPoints) return MembershipTier.Gold;
        if (points >= SilverMinPoints) return MembershipTier.Silver;
        return MembershipTier.Regular;
    }
    
    public static decimal GetDiscountPercentage(MembershipTier tier)
    {
        return tier switch
        {
            MembershipTier.Diamond => DiamondDiscount,
            MembershipTier.Gold => GoldDiscount,
            MembershipTier.Silver => SilverDiscount,
            _ => RegularDiscount
        };
    }
    
    public static int CalculatePoints(decimal amount)
    {
        return (int)(amount * PointsPerVnd);
    }
}

public static class BookingConstants
{
    public static readonly TimeSpan OtpExpirationTime = TimeSpan.FromMinutes(5);
    public static readonly TimeSpan DefaultBookingExpiration = TimeSpan.FromMinutes(15);
}
