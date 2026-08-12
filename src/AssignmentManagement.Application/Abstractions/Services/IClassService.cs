using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Classes;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IClassService
{
    Task<PagedResult<ClassListItemDto>> GetClassesAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<ClassDetailDto?> GetClassAsync(int id, CancellationToken cancellationToken = default);

    Task<ClassDetailDto> CreateClassAsync(CreateClassRequestDto request, CancellationToken cancellationToken = default);

    Task<ClassDetailDto?> UpdateClassAsync(int id, UpdateClassRequestDto request, CancellationToken cancellationToken = default);

    Task<ClassDetailDto?> AssignSubjectAsync(int id, AssignSubjectRequestDto request, CancellationToken cancellationToken = default);

    Task<ClassDetailDto?> AssignTeacherAsync(int id, AssignTeacherRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteClassAsync(int id, CancellationToken cancellationToken = default);
}