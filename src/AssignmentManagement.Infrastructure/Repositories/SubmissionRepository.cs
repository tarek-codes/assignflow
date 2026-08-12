using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Repositories;

public sealed class SubmissionRepository : ISubmissionRepository
{
    private readonly ApplicationDbContext _context;

    public SubmissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Submission?> GetByIdAsync(int submissionId, bool tracking = false, CancellationToken cancellationToken = default)
    {
        var query = tracking ? _context.Submissions : _context.Submissions.AsNoTracking();

        return await query
            .Include(s => s.Assignment)
                .ThenInclude(a => a!.Class)
                    .ThenInclude(c => c!.Teacher)
            .Include(s => s.Student)
                .ThenInclude(st => st!.User)
            .FirstOrDefaultAsync(s => s.Id == submissionId, cancellationToken);
    }

    public async Task<Submission?> GetByAssignmentAndStudentAsync(int assignmentId, int studentId, bool tracking = false, CancellationToken cancellationToken = default)
    {
        var query = tracking ? _context.Submissions : _context.Submissions.AsNoTracking();

        return await query
            .Include(s => s.Assignment)
                .ThenInclude(a => a!.Class)
            .Include(s => s.Student)
                .ThenInclude(st => st!.User)
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId, cancellationToken);
    }

    public async Task<PagedResult<Submission>> GetSubmissionsByAssignmentAsync(int assignmentId, PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.Submissions
            .AsNoTracking()
            .Include(s => s.Assignment)
                .ThenInclude(a => a!.Class)
                    .ThenInclude(c => c!.Subject)
            .Include(s => s.Student)
                .ThenInclude(st => st!.User)
            .Where(s => s.AssignmentId == assignmentId);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(s => s.SubmittedAtUtc)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Submission>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<PagedResult<Submission>> GetSubmissionsByStudentUserAsync(int studentUserId, PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.Submissions
            .AsNoTracking()
            .Include(s => s.Assignment)
                .ThenInclude(a => a!.Class)
                    .ThenInclude(c => c!.Subject)
            .Include(s => s.Student)
                .ThenInclude(st => st!.User)
            .Where(s => s.Student != null && s.Student.UserId == studentUserId && s.Status != SubmissionStatus.NotSubmitted && s.SubmittedAtUtc != null);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(s => s.SubmittedAtUtc)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Submission>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<PagedResult<Submission>> GetAllSubmissionsAsync(PaginationQueryDto query, int? teacherUserId = null, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.Submissions
            .AsNoTracking()
            .Include(s => s.Assignment)
                .ThenInclude(a => a!.Class)
                    .ThenInclude(c => c!.Subject)
            .Include(s => s.Student)
                .ThenInclude(st => st!.User)
            .AsQueryable();

        if (teacherUserId.HasValue)
        {
            dbQuery = dbQuery.Where(s => s.Assignment != null && s.Assignment.Class != null && s.Assignment.Class.Teacher != null && s.Assignment.Class.Teacher.UserId == teacherUserId.Value);
        }

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(s => s.SubmittedAtUtc)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Submission>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Student?> GetStudentByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Students
            .AsNoTracking()
            .Include(st => st.User)
            .FirstOrDefaultAsync(st => st.UserId == userId, cancellationToken);
    }

    public async Task<bool> IsStudentEnrolledInAssignmentClassAsync(int studentId, int assignmentId, CancellationToken cancellationToken = default)
    {
        var classId = await _context.Assignments
            .AsNoTracking()
            .Where(a => a.Id == assignmentId)
            .Select(a => a.ClassId)
            .FirstOrDefaultAsync(cancellationToken);

        if (classId == 0) return false;

        return await _context.StudentClasses
            .AsNoTracking()
            .AnyAsync(sc => sc.StudentId == studentId && sc.ClassId == classId, cancellationToken);
    }

    public async Task AddAsync(Submission submission, CancellationToken cancellationToken = default)
    {
        await _context.Submissions.AddAsync(submission, cancellationToken);
    }

    public void Remove(Submission submission)
    {
        _context.Submissions.Remove(submission);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
