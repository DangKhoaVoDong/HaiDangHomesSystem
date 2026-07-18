using HaiDangHomes.Domain.Common;
using HaiDangHomes.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace HaiDangHomes.Domain.Entities;

public class Property : AuditableEntityBase<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid HostId { get; set; }
    public Guid CategoryId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public int TotalRooms { get; set; } = 0;

    /// <summary>
    /// Thương hiệu của căn nhà. Hai giá trị hợp lệ: HAIDANG HOMESTAYS hoặc NOVA WORD.
    /// Nullable để tương thích ngược với property cũ.
    /// </summary>
    [MaxLength(64)]
    public string? BrandName { get; set; }
    
    // Navigation properties
    public virtual User Host { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
    public virtual ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
    public virtual ICollection<PropertyAmenity> Amenities { get; set; } = new List<PropertyAmenity>();
}
