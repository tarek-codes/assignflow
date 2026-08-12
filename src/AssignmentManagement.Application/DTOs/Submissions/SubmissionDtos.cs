using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace AssignmentManagement.Application.DTOs.Submissions;

public sealed class SubmitAssignmentRequestDto
{
    public IFormFile File { get; set; } = null!;

    public string? SubmissionText { get; set; }
}

public sealed class GradeSubmissionRequestDto
{
    public decimal Marks { get; set; }

    public string? Feedback { get; set; }

    public SubmissionStatus? Status { get; set; }
}

public sealed class UpdateSubmissionStatusRequestDto
{
    public SubmissionStatus Status { get; set; }
}

public class SubmissionListItemDto
{
    public int Id { get; set; }

    public int AssignmentId { get; set; }

    public string AssignmentTitle { get; set; } = string.Empty;

    public string ClassSubject { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    public int StudentId { get; set; }

    public int StudentUserId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string StudentNumber { get; set; } = string.Empty;

    public string? SubmissionText { get; set; }

    public string? FileUrl { get; set; }

    public DateTime? SubmittedAtUtc { get; set; }

    public decimal? Marks { get; set; }

    public int MaxMarks { get; set; }

    public string? Feedback { get; set; }

    public SubmissionStatus Status { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class SubmissionDetailDto : SubmissionListItemDto
{
}

public sealed class FileStreamResultDto
{
    public Stream FileStream { get; set; } = null!;

    public string ContentType { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public bool IsInline { get; set; }
}
