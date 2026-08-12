using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Mapping;

public static class SubjectMapping
{
    public static SubjectListItemDto ToListItemDto(Subject subject)
    {
        return new SubjectListItemDto
        {
            Id = subject.Id,
            SubjectName = subject.SubjectName,
            SubjectCode = subject.SubjectCode,
            Description = subject.Description
        };
    }

    public static SubjectDetailDto ToDetailDto(Subject subject)
    {
        return new SubjectDetailDto
        {
            Id = subject.Id,
            SubjectName = subject.SubjectName,
            SubjectCode = subject.SubjectCode,
            Description = subject.Description
        };
    }
}