using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class TeacherSubject
{
    [ForeignKey(nameof(Teacher))]
    public int TeacherId { get; set; }

    public Teacher? Teacher { get; set; }

    [ForeignKey(nameof(Subject))]
    public int SubjectId { get; set; }

    public Subject? Subject { get; set; }
}
