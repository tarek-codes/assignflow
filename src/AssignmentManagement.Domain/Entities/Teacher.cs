using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Teacher : EntityBase
{
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public User? User { get; set; }

    [MaxLength(100)]
    public string? Designation { get; set; }

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = [];

    public ICollection<Class> Classes { get; set; } = [];
}