using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs.Assignments;

public sealed class AssignmentListItemDto
{
    public int Id { get; set; }

    public int ClassId { get; set; }

    public int ClassLevel { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; }

    public bool AllowResubmission { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}

public sealed class AssignmentDetailDto
{
    public int Id { get; set; }

    public int ClassId { get; set; }

    public int ClassLevel { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Instructions { get; set; }

    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public AssignmentStatus Status { get; set; }

    public bool AllowResubmission { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class CreateAssignmentRequestDto
{
    public int ClassId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Instructions { get; set; }

    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public bool AllowResubmission { get; set; } = true;
}

public sealed class UpdateAssignmentRequestDto
{
    public int ClassId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Instructions { get; set; }

    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public bool AllowResubmission { get; set; } = true;
}