using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Repositories;

public sealed class AssignmentRepository : IAssignmentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public AssignmentRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> ClassExistsAsync(int classId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Classes.AnyAsync(entity => entity.Id == classId && entity.IsActive, cancellationToken);
    }

    public async Task<Class?> GetClassAsync(int classId, bool tracking = false, CancellationToken cancellationToken = default)
    {
        var query = tracking ? _dbContext.Classes : _dbContext.Classes.AsNoTracking();

        return await query
            .Include(entity => entity.Subject)
            .Include(entity => entity.Teacher)
                .ThenInclude(entity => entity!.User)
            .SingleOrDefaultAsync(entity => entity.Id == classId && entity.IsActive, cancellationToken);
    }

    public async Task<PagedResult<Assignment>> GetAssignmentsAsync(int? teacherUserId, PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var assignments = _dbContext.Assignments
            .AsNoTracking()
            .Include(entity => entity.Class)
                .ThenInclude(entity => entity!.Subject)
            .Include(entity => entity.Class)
                .ThenInclude(entity => entity!.Teacher)
                    .ThenInclude(entity => entity!.User)
            .Where(entity => entity.Class != null && entity.Class.IsActive);

        if (teacherUserId.HasValue && teacherUserId.Value > 0)
        {
            assignments = assignments.Where(entity => entity.Class!.Teacher != null && entity.Class.Teacher.UserId == teacherUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            assignments = assignments.Where(entity =>
                EF.Functions.ILike(entity.Title, $"%{search}%") ||
                EF.Functions.ILike(entity.Description ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(entity.Instructions ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(entity.Class!.Subject!.SubjectName, $"%{search}%") ||
                EF.Functions.ILike(entity.Class!.Subject!.SubjectCode ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(entity.Class!.ClassLevel.ToString(), $"%{search}%") ||
                EF.Functions.ILike(entity.Status.ToString(), $"%{search}%"));
        }

        assignments = ApplySort(assignments, query);

        var totalCount = await assignments.CountAsync(cancellationToken);
        var items = await assignments
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Assignment>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Assignment?> GetAssignmentAsync(int id, bool tracking = false, CancellationToken cancellationToken = default)
    {
        var query = tracking ? _dbContext.Assignments : _dbContext.Assignments.AsNoTracking();

        return await query
            .Include(entity => entity.Class)
                .ThenInclude(entity => entity!.Subject)
            .Include(entity => entity.Class)
                .ThenInclude(entity => entity!.Teacher)
                    .ThenInclude(entity => entity!.User)
            .SingleOrDefaultAsync(entity => entity.Id == id, cancellationToken);
    }

    public async Task AddAsync(Assignment assignment, CancellationToken cancellationToken = default)
    {
        await _dbContext.Assignments.AddAsync(assignment, cancellationToken);
    }

    public void Remove(Assignment assignment)
    {
        _dbContext.Assignments.Remove(assignment);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<Assignment> ApplySort(IQueryable<Assignment> query, PaginationQueryDto request)
    {
        var descending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "title" => descending ? query.OrderByDescending(entity => entity.Title) : query.OrderBy(entity => entity.Title),
            "deadline" or "deadlineutc" => descending ? query.OrderByDescending(entity => entity.DeadlineUtc) : query.OrderBy(entity => entity.DeadlineUtc),
            "status" => descending ? query.OrderByDescending(entity => entity.Status) : query.OrderBy(entity => entity.Status),
            "classlevel" or "class_level" => descending ? query.OrderByDescending(entity => entity.Class!.ClassLevel) : query.OrderBy(entity => entity.Class!.ClassLevel),
            "subjectname" or "subject_name" => descending ? query.OrderByDescending(entity => entity.Class!.Subject!.SubjectName) : query.OrderBy(entity => entity.Class!.Subject!.SubjectName),
            _ => descending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }
}