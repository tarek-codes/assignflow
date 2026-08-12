using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Domain.Entities;

public sealed class Subject : EntityBase
{
    [Required]
    [MaxLength(100)]
    public string SubjectName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? SubjectCode { get; set; }

    public string? Description { get; set; }

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = [];

    public ICollection<Class> Classes { get; set; } = [];
}