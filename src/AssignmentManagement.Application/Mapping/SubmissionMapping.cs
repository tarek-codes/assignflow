using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Mapping;

public static class SubmissionMapping
{
    public static SubmissionListItemDto ToListItemDto(Submission submission)
    {
        var studentUser = submission.Student?.User;
        var studentName = studentUser is null
            ? string.Empty
            : string.Join(' ', new[] { studentUser.FirstName, studentUser.LastName }.Where(part => !string.IsNullOrWhiteSpace(part)));

        var classSubject = submission.Assignment?.Class != null
            ? $"Class {submission.Assignment.Class.ClassLevel} - {submission.Assignment.Class.Subject?.SubjectName}"
            : string.Empty;

        var isOverdueUnsubmitted = submission.Status != SubmissionStatus.Graded &&
                                   submission.SubmittedAtUtc == null &&
                                   submission.Assignment != null &&
                                   submission.Assignment.DeadlineUtc < DateTime.UtcNow;

        var status = isOverdueUnsubmitted ? SubmissionStatus.Missing : submission.Status;
        var marks = (isOverdueUnsubmitted && submission.Marks == null) ? 0 : submission.Marks;

        return new SubmissionListItemDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            AssignmentTitle = submission.Assignment?.Title ?? string.Empty,
            ClassSubject = classSubject,
            SubjectName = submission.Assignment?.Class?.Subject?.SubjectName ?? string.Empty,
            ClassLevel = submission.Assignment?.Class?.ClassLevel ?? submission.Student?.ClassLevel ?? 6,
            StudentId = submission.StudentId,
            StudentUserId = submission.Student?.UserId ?? 0,
            StudentName = studentName,
            StudentNumber = submission.Student?.StudentNumber ?? string.Empty,
            SubmissionText = submission.SubmissionText,
            FileUrl = submission.FileUrl,
            SubmittedAtUtc = submission.SubmittedAtUtc,
            Marks = marks,
            MaxMarks = submission.Assignment?.MaxMarks ?? 0,
            Feedback = isOverdueUnsubmitted && string.IsNullOrWhiteSpace(submission.Feedback) ? "Automatically marked as Missing (0 marks) after deadline passed." : submission.Feedback,
            Status = status,
            UpdatedAtUtc = submission.UpdatedAtUtc
        };
    }

    public static SubmissionDetailDto ToDetailDto(Submission submission)
    {
        var listItem = ToListItemDto(submission);
        return new SubmissionDetailDto
        {
            Id = listItem.Id,
            AssignmentId = listItem.AssignmentId,
            AssignmentTitle = listItem.AssignmentTitle,
            ClassSubject = listItem.ClassSubject,
            StudentId = listItem.StudentId,
            StudentUserId = listItem.StudentUserId,
            StudentName = listItem.StudentName,
            StudentNumber = listItem.StudentNumber,
            SubmissionText = listItem.SubmissionText,
            FileUrl = listItem.FileUrl,
            SubmittedAtUtc = listItem.SubmittedAtUtc,
            Marks = listItem.Marks,
            MaxMarks = listItem.MaxMarks,
            Feedback = listItem.Feedback,
            Status = listItem.Status,
            UpdatedAtUtc = listItem.UpdatedAtUtc
        };
    }
}
