using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Submissions;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface ISubmissionService
{
    Task<SubmissionDetailDto> SubmitOrReplaceAsync(int assignmentId, SubmitAssignmentRequestDto request, CancellationToken cancellationToken = default);

    Task<SubmissionDetailDto?> GetMySubmissionAsync(int assignmentId, CancellationToken cancellationToken = default);

    Task<PagedResult<SubmissionListItemDto>> GetMySubmissionsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<PagedResult<SubmissionListItemDto>> GetSubmissionsForAssignmentAsync(int assignmentId, PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<PagedResult<SubmissionListItemDto>> GetAllSubmissionsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<SubmissionDetailDto?> GetSubmissionByIdAsync(int submissionId, CancellationToken cancellationToken = default);

    Task<SubmissionDetailDto> GradeSubmissionAsync(int submissionId, GradeSubmissionRequestDto request, CancellationToken cancellationToken = default);

    Task<SubmissionDetailDto> UpdateSubmissionStatusAsync(int submissionId, UpdateSubmissionStatusRequestDto request, CancellationToken cancellationToken = default);

    Task<FileStreamResultDto> GetSubmissionFileStreamAsync(int submissionId, bool isPreview, CancellationToken cancellationToken = default);
}
