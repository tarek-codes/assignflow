using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    void Update(User user);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}