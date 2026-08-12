using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Class : EntityBase
{
    [Required]
    public int ClassLevel { get; set; }

    [ForeignKey(nameof(Subject))]
    public int SubjectId { get; set; }

    public Subject? Subject { get; set; }

    [ForeignKey(nameof(Teacher))]
    public int TeacherId { get; set; }

    public Teacher? Teacher { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<StudentClass> StudentClasses { get; set; } = [];

    public ICollection<Assignment> Assignments { get; set; } = [];
}