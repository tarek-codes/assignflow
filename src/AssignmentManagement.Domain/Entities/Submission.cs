using AssignmentManagement.Domain.Common;
using AssignmentManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssignmentManagement.Domain.Entities;

public sealed class Submission : EntityBase
{
    [ForeignKey(nameof(Assignment))]
    public int AssignmentId { get; set; }

    public Assignment? Assignment { get; set; }

    [ForeignKey(nameof(Student))]
    public int StudentId { get; set; }

    public Student? Student { get; set; }

    public string? SubmissionText { get; set; }

    public string? FileUrl { get; set; }

    public DateTime? SubmittedAtUtc { get; set; }

    public decimal? Marks { get; set; }

    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}