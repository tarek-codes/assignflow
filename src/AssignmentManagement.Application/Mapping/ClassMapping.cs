using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Mapping;

public static class ClassMapping
{
    public static ClassListItemDto ToListItemDto(Class @class)
    {
        return new ClassListItemDto
        {
            Id = @class.Id,
            ClassLevel = @class.ClassLevel,
            SubjectId = @class.SubjectId,
            SubjectName = @class.Subject?.SubjectName ?? string.Empty,
            SubjectCode = @class.Subject?.SubjectCode,
            TeacherId = @class.TeacherId,
            TeacherName = string.Join(' ', new[] { @class.Teacher?.User?.FirstName, @class.Teacher?.User?.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            TeacherEmail = @class.Teacher?.User?.Email ?? string.Empty,
            Description = @class.Description,
            IsActive = @class.IsActive
        };
    }

    public static ClassDetailDto ToDetailDto(Class @class)
    {
        return new ClassDetailDto
        {
            Id = @class.Id,
            ClassLevel = @class.ClassLevel,
            SubjectId = @class.SubjectId,
            SubjectName = @class.Subject?.SubjectName ?? string.Empty,
            SubjectCode = @class.Subject?.SubjectCode,
            TeacherId = @class.TeacherId,
            TeacherName = string.Join(' ', new[] { @class.Teacher?.User?.FirstName, @class.Teacher?.User?.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            TeacherEmail = @class.Teacher?.User?.Email ?? string.Empty,
            Description = @class.Description,
            IsActive = @class.IsActive,
            CreatedAtUtc = @class.CreatedAtUtc,
            UpdatedAtUtc = @class.UpdatedAtUtc
        };
    }
}