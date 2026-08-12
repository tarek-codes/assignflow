using AssignmentManagement.Domain.Common;
using AssignmentManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Assignment : EntityBase
{
    [ForeignKey(nameof(Class))]
    public int ClassId { get; set; }

    public Class? Class { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Instructions { get; set; }

    [Required]
    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; }

    public bool AllowResubmission { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<Submission> Submissions { get; set; } = [];
}