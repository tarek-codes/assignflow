using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IClassRepository
{
    Task<bool> HasDuplicateCombinationAsync(int classLevel, int subjectId, int? excludeClassId = null, CancellationToken cancellationToken = default);

    Task<bool> SubjectExistsAsync(int subjectId, CancellationToken cancellationToken = default);

    Task<bool> TeacherExistsAsync(int teacherId, CancellationToken cancellationToken = default);

    Task<PagedResult<Class>> GetClassesAsync(PaginationQueryDto query, int? teacherUserId = null, CancellationToken cancellationToken = default);

    Task<Class?> GetClassAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Class @class, CancellationToken cancellationToken = default);

    void Update(Class @class);

    void Remove(Class @class);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}