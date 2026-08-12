using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Admin : EntityBase
{
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public User? User { get; set; }

    public ICollection<AppSetting> UpdatedAppSettings { get; set; } = [];
}