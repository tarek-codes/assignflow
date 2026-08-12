using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Repositories;

public sealed class SubjectRepository : ISubjectRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SubjectRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> NameExistsAsync(string subjectName, int? excludeSubjectId = null, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subjects.AnyAsync(subject => subject.SubjectName == subjectName && (!excludeSubjectId.HasValue || subject.Id != excludeSubjectId.Value), cancellationToken);
    }

    public async Task<bool> CodeExistsAsync(string? subjectCode, int? excludeSubjectId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(subjectCode))
        {
            return false;
        }

        return await _dbContext.Subjects.AnyAsync(subject => subject.SubjectCode == subjectCode && (!excludeSubjectId.HasValue || subject.Id != excludeSubjectId.Value), cancellationToken);
    }

    public async Task<bool> HasClassesAsync(int subjectId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Classes.AnyAsync(@class => @class.SubjectId == subjectId, cancellationToken);
    }

    public async Task<PagedResult<Subject>> GetSubjectsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var subjects = _dbContext.Subjects.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            subjects = subjects.Where(subject =>
                EF.Functions.ILike(subject.SubjectName, $"%{search}%") ||
                EF.Functions.ILike(subject.SubjectCode ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(subject.Description ?? string.Empty, $"%{search}%"));
        }

        subjects = ApplySort(subjects, query);

        var totalCount = await subjects.CountAsync(cancellationToken);
        var items = await subjects
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Subject>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Subject?> GetSubjectAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subjects.AsNoTracking().SingleOrDefaultAsync(subject => subject.Id == id, cancellationToken);
    }

    public async Task AddAsync(Subject subject, CancellationToken cancellationToken = default)
    {
        await _dbContext.Subjects.AddAsync(subject, cancellationToken);
    }

    public void Update(Subject subject)
    {
        _dbContext.Subjects.Update(subject);
    }

    public void Remove(Subject subject)
    {
        _dbContext.Subjects.Remove(subject);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<Subject> ApplySort(IQueryable<Subject> query, PaginationQueryDto request)
    {
        var descending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "subjectname" or "subject_name" => descending ? query.OrderByDescending(subject => subject.SubjectName) : query.OrderBy(subject => subject.SubjectName),
            "subjectcode" or "subject_code" => descending ? query.OrderByDescending(subject => subject.SubjectCode) : query.OrderBy(subject => subject.SubjectCode),
            "description" => descending ? query.OrderByDescending(subject => subject.Description) : query.OrderBy(subject => subject.Description),
            _ => descending ? query.OrderByDescending(subject => subject.Id) : query.OrderBy(subject => subject.Id)
        };
    }
}