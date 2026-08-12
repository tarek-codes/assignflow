using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface ISubjectRepository
{
    Task<bool> NameExistsAsync(string subjectName, int? excludeSubjectId = null, CancellationToken cancellationToken = default);

    Task<bool> CodeExistsAsync(string? subjectCode, int? excludeSubjectId = null, CancellationToken cancellationToken = default);

    Task<bool> HasClassesAsync(int subjectId, CancellationToken cancellationToken = default);

    Task<PagedResult<Subject>> GetSubjectsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<Subject?> GetSubjectAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Subject subject, CancellationToken cancellationToken = default);

    void Update(Subject subject);

    void Remove(Subject subject);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}