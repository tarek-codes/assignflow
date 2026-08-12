using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IUserManagementRepository
{
    Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default);

    Task<PagedResult<User>> GetUsersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<Teacher>> GetTeachersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<Teacher?> GetTeacherAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<Student>> GetStudentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<Student?> GetStudentAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<Admin>> GetAdminsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<Admin?> GetAdminAsync(int id, CancellationToken cancellationToken = default);

    Task<List<Subject>> GetAllSubjectsAsync(CancellationToken cancellationToken = default);

    Task AddAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default) where TEntity : class;

    void Update<TEntity>(TEntity entity) where TEntity : class;

    void Remove<TEntity>(TEntity entity) where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}