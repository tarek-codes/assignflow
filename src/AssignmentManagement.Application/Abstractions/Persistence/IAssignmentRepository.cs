using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IAssignmentRepository
{
    Task<bool> ClassExistsAsync(int classId, CancellationToken cancellationToken = default);

    Task<Class?> GetClassAsync(int classId, bool tracking = false, CancellationToken cancellationToken = default);

    Task<PagedResult<Assignment>> GetAssignmentsAsync(int? teacherUserId, PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<Assignment?> GetAssignmentAsync(int id, bool tracking = false, CancellationToken cancellationToken = default);

    Task AddAsync(Assignment assignment, CancellationToken cancellationToken = default);

    void Remove(Assignment assignment);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}