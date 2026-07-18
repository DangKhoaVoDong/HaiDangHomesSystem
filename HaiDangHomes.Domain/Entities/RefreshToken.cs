using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class RefreshToken : EntityBase<Guid>
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsExpired && !IsRevoked;
    
    // Navigation property
    public virtual User User { get; set; } = null!;
}
