namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IApplicationDbContext
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}