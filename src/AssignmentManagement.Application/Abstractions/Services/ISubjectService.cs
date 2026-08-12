using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Subjects;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface ISubjectService
{
    Task<PagedResult<SubjectListItemDto>> GetSubjectsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<SubjectDetailDto?> GetSubjectAsync(int id, CancellationToken cancellationToken = default);

    Task<SubjectDetailDto> CreateSubjectAsync(CreateSubjectRequestDto request, CancellationToken cancellationToken = default);

    Task<SubjectDetailDto?> UpdateSubjectAsync(int id, UpdateSubjectRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteSubjectAsync(int id, CancellationToken cancellationToken = default);
}