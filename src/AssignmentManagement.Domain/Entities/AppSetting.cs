using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class AppSetting : EntityBase
{
    [Required]
    [MaxLength(100)]
    public string SettingKey { get; set; } = string.Empty;

    public string? SettingValue { get; set; }

    public string? Description { get; set; }

    [ForeignKey(nameof(UpdatedByAdmin))]
    public int? UpdatedByAdminId { get; set; }

    public Admin? UpdatedByAdmin { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}