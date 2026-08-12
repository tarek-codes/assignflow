using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Repositories;

public sealed class ClassRepository : IClassRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ClassRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> HasDuplicateCombinationAsync(int classLevel, int subjectId, int? excludeClassId = null, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Classes.AnyAsync(entity => entity.ClassLevel == classLevel && entity.SubjectId == subjectId && (!excludeClassId.HasValue || entity.Id != excludeClassId.Value), cancellationToken);
    }

    public async Task<bool> SubjectExistsAsync(int subjectId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subjects.AnyAsync(entity => entity.Id == subjectId, cancellationToken);
    }

    public async Task<bool> TeacherExistsAsync(int teacherId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Teachers.AnyAsync(entity => entity.Id == teacherId && entity.User != null && entity.User.IsActive, cancellationToken);
    }

    public async Task<PagedResult<Class>> GetClassesAsync(PaginationQueryDto query, int? teacherUserId = null, CancellationToken cancellationToken = default)
    {
        var classes = _dbContext.Classes
            .AsNoTracking()
            .Include(entity => entity.Subject)
            .Include(entity => entity.Teacher)
                .ThenInclude(entity => entity!.User)
            .Where(entity => entity.IsActive && (!teacherUserId.HasValue || (entity.Teacher != null && entity.Teacher.UserId == teacherUserId.Value)));

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            classes = classes.Where(entity =>
                EF.Functions.ILike(entity.ClassLevel.ToString(), $"%{search}%") ||
                (entity.Subject != null && EF.Functions.ILike(entity.Subject.SubjectName, $"%{search}%")) ||
                (entity.Subject != null && EF.Functions.ILike(entity.Subject.SubjectCode ?? string.Empty, $"%{search}%")) ||
                (entity.Teacher != null && entity.Teacher.User != null && EF.Functions.ILike(entity.Teacher.User.FirstName, $"%{search}%")) ||
                (entity.Teacher != null && entity.Teacher.User != null && EF.Functions.ILike(entity.Teacher.User.LastName ?? string.Empty, $"%{search}%")) ||
                (entity.Teacher != null && entity.Teacher.User != null && EF.Functions.ILike(entity.Teacher.User.Email, $"%{search}%")) ||
                EF.Functions.ILike(entity.Description ?? string.Empty, $"%{search}%"));
        }

        classes = ApplySort(classes, query);

        var totalCount = await classes.CountAsync(cancellationToken);
        var items = await classes
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Class>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Class?> GetClassAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Classes
            .Include(entity => entity.Subject)
            .Include(entity => entity.Teacher)
                .ThenInclude(entity => entity!.User)
            .SingleOrDefaultAsync(entity => entity.Id == id && entity.IsActive, cancellationToken);
    }

    public async Task AddAsync(Class @class, CancellationToken cancellationToken = default)
    {
        await _dbContext.Classes.AddAsync(@class, cancellationToken);
    }

    public void Update(Class @class)
    {
        _dbContext.Classes.Update(@class);
    }

    public void Remove(Class @class)
    {
        _dbContext.Classes.Remove(@class);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<Class> ApplySort(IQueryable<Class> query, PaginationQueryDto request)
    {
        var descending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "classlevel" or "class_level" => descending ? query.OrderByDescending(entity => entity.ClassLevel) : query.OrderBy(entity => entity.ClassLevel),
            "subjectname" or "subject_name" => descending ? query.OrderByDescending(entity => entity.Subject != null ? entity.Subject.SubjectName : string.Empty) : query.OrderBy(entity => entity.Subject != null ? entity.Subject.SubjectName : string.Empty),
            "teachername" or "teacher_name" => descending ? query.OrderByDescending(entity => entity.Teacher != null && entity.Teacher.User != null ? entity.Teacher.User.FirstName : string.Empty) : query.OrderBy(entity => entity.Teacher != null && entity.Teacher.User != null ? entity.Teacher.User.FirstName : string.Empty),
            "createdatutc" or "created_at" => descending ? query.OrderByDescending(entity => entity.CreatedAtUtc) : query.OrderBy(entity => entity.CreatedAtUtc),
            _ => descending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }
}