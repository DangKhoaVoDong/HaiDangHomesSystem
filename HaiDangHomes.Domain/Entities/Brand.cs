using System.ComponentModel.DataAnnotations;
using HaiDangHomes.Domain.Common;

namespace HaiDangHomes.Domain.Entities;

public class Brand : AuditableEntityBase<Guid>
{
    [MaxLength(64)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
