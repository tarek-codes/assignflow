using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Assignments;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IAssignmentService
{
    Task<PagedResult<AssignmentListItemDto>> GetAssignmentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<AssignmentDetailDto?> GetAssignmentAsync(int id, CancellationToken cancellationToken = default);

    Task<AssignmentDetailDto> CreateAssignmentAsync(CreateAssignmentRequestDto request, CancellationToken cancellationToken = default);

    Task<AssignmentDetailDto?> UpdateAssignmentAsync(int id, UpdateAssignmentRequestDto request, CancellationToken cancellationToken = default);

    Task<AssignmentDetailDto?> PublishAssignmentAsync(int id, CancellationToken cancellationToken = default);

    Task<AssignmentDetailDto?> SaveDraftAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> DeleteAssignmentAsync(int id, CancellationToken cancellationToken = default);
}