using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class StudentClass : EntityBase
{
    [ForeignKey(nameof(Student))]
    public int StudentId { get; set; }

    public Student? Student { get; set; }

    [ForeignKey(nameof(Class))]
    public int ClassId { get; set; }

    public Class? Class { get; set; }

    public DateTime EnrolledAtUtc { get; set; }
}