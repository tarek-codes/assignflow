using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface ISubmissionRepository
{
    Task<Submission?> GetByIdAsync(int submissionId, bool tracking = false, CancellationToken cancellationToken = default);

    Task<Submission?> GetByAssignmentAndStudentAsync(int assignmentId, int studentId, bool tracking = false, CancellationToken cancellationToken = default);

    Task<PagedResult<Submission>> GetSubmissionsByAssignmentAsync(int assignmentId, PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<PagedResult<Submission>> GetSubmissionsByStudentUserAsync(int studentUserId, PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<PagedResult<Submission>> GetAllSubmissionsAsync(PaginationQueryDto query, int? teacherUserId = null, CancellationToken cancellationToken = default);

    Task<Student?> GetStudentByUserIdAsync(int userId, CancellationToken cancellationToken = default);

    Task<bool> IsStudentEnrolledInAssignmentClassAsync(int studentId, int assignmentId, CancellationToken cancellationToken = default);

    Task AddAsync(Submission submission, CancellationToken cancellationToken = default);

    void Remove(Submission submission);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
