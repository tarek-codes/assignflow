using AssignmentManagement.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Student : EntityBase
{
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Required]
    [MaxLength(50)]
    public string StudentNumber { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    [MaxLength(50)]
    public string Group { get; set; } = "None"; // "Science", "Business Studies", "Humanities", "None"

    public ICollection<StudentClass> StudentClasses { get; set; } = [];

    public ICollection<Submission> Submissions { get; set; } = [];
}