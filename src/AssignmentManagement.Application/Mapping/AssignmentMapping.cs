using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Mapping;

public static class AssignmentMapping
{
    public static AssignmentListItemDto ToListItemDto(Assignment assignment)
    {
        return new AssignmentListItemDto
        {
            Id = assignment.Id,
            ClassId = assignment.ClassId,
            ClassLevel = assignment.Class?.ClassLevel ?? 0,
            SubjectName = assignment.Class?.Subject?.SubjectName ?? string.Empty,
            SubjectCode = assignment.Class?.Subject?.SubjectCode,
            TeacherName = string.Join(' ', new[] { assignment.Class?.Teacher?.User?.FirstName, assignment.Class?.Teacher?.User?.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            Title = assignment.Title,
            DeadlineUtc = assignment.DeadlineUtc,
            MaxMarks = assignment.MaxMarks,
            Status = assignment.Status,
            AllowResubmission = assignment.AllowResubmission,
            CreatedAtUtc = assignment.CreatedAtUtc
        };
    }

    public static AssignmentDetailDto ToDetailDto(Assignment assignment)
    {
        return new AssignmentDetailDto
        {
            Id = assignment.Id,
            ClassId = assignment.ClassId,
            ClassLevel = assignment.Class?.ClassLevel ?? 0,
            SubjectName = assignment.Class?.Subject?.SubjectName ?? string.Empty,
            SubjectCode = assignment.Class?.Subject?.SubjectCode,
            TeacherName = string.Join(' ', new[] { assignment.Class?.Teacher?.User?.FirstName, assignment.Class?.Teacher?.User?.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            Title = assignment.Title,
            Description = assignment.Description,
            Instructions = assignment.Instructions,
            DeadlineUtc = assignment.DeadlineUtc,
            MaxMarks = assignment.MaxMarks,
            Status = assignment.Status,
            AllowResubmission = assignment.AllowResubmission,
            CreatedAtUtc = assignment.CreatedAtUtc,
            UpdatedAtUtc = assignment.UpdatedAtUtc
        };
    }
}