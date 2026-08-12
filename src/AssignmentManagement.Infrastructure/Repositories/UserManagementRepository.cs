using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Repositories;

public sealed class UserManagementRepository : IUserManagementRepository, IUserRepository
{
    private readonly ApplicationDbContext _dbContext;

    public UserManagementRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users.AnyAsync(user => user.Email == email && (!excludeUserId.HasValue || user.Id != excludeUserId.Value), cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await Users(true).SingleOrDefaultAsync(user => user.Email.ToLower() == normalized && user.IsActive, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await Users(true).SingleOrDefaultAsync(user => user.Id == id && user.IsActive, cancellationToken);
    }

    public void Update(User user)
    {
        _dbContext.Users.Update(user);
    }

    public IQueryable<User> Users(bool tracking = false)
    {
        return tracking ? _dbContext.Users : _dbContext.Users.AsNoTracking();
    }

    public IQueryable<Teacher> Teachers(bool tracking = false)
    {
        var query = tracking ? _dbContext.Teachers : _dbContext.Teachers.AsNoTracking();
        return query
            .Include(entity => entity.User)
            .Include(entity => entity.TeacherSubjects)
                .ThenInclude(ts => ts.Subject);
    }

    public IQueryable<Student> Students(bool tracking = false)
    {
        var query = tracking ? _dbContext.Students : _dbContext.Students.AsNoTracking();
        return query.Include(entity => entity.User);
    }

    public IQueryable<Admin> Admins(bool tracking = false)
    {
        var query = tracking ? _dbContext.Admins : _dbContext.Admins.AsNoTracking();
        return query.Include(entity => entity.User);
    }

    public Task<List<Subject>> GetAllSubjectsAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.Subjects.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<User>> GetUsersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var users = Users()
            .Where(user => user.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            users = users.Where(user =>
                EF.Functions.ILike(user.FirstName, $"%{search}%") ||
                EF.Functions.ILike(user.LastName ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(user.Email, $"%{search}%") ||
                EF.Functions.ILike(user.Phone ?? string.Empty, $"%{search}%"));
        }

        users = ApplyUserSort(users, query);

        var totalCount = await users.CountAsync(cancellationToken);
        var items = await users
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default)
    {
        return await Users(true).SingleOrDefaultAsync(user => user.Id == id && user.IsActive, cancellationToken);
    }

    public async Task<PagedResult<Teacher>> GetTeachersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var teachers = Teachers()
            .Where(teacher => teacher.User != null && teacher.User.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            teachers = teachers.Where(teacher =>
                EF.Functions.ILike(teacher.User!.FirstName, $"%{search}%") ||
                EF.Functions.ILike(teacher.User.LastName ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(teacher.User.Email, $"%{search}%") ||
                EF.Functions.ILike(teacher.Designation ?? string.Empty, $"%{search}%"));
        }

        teachers = ApplyTeacherSort(teachers, query);

        var totalCount = await teachers.CountAsync(cancellationToken);
        var items = await teachers
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Teacher>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Teacher?> GetTeacherAsync(int id, CancellationToken cancellationToken = default)
    {
        return await Teachers(true).SingleOrDefaultAsync(teacher => teacher.Id == id && teacher.User != null && teacher.User.IsActive, cancellationToken);
    }

    public async Task<PagedResult<Student>> GetStudentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var students = Students()
            .Where(student => student.User != null && student.User.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            students = students.Where(student =>
                EF.Functions.ILike(student.User!.FirstName, $"%{search}%") ||
                EF.Functions.ILike(student.User.LastName ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(student.User.Email, $"%{search}%") ||
                EF.Functions.ILike(student.StudentNumber, $"%{search}%"));
        }

        students = ApplyStudentSort(students, query);

        var totalCount = await students.CountAsync(cancellationToken);
        var items = await students
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Student>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Student?> GetStudentAsync(int id, CancellationToken cancellationToken = default)
    {
        return await Students(true).SingleOrDefaultAsync(student => student.Id == id && student.User != null && student.User.IsActive, cancellationToken);
    }

    public async Task<PagedResult<Admin>> GetAdminsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var admins = Admins()
            .Where(admin => admin.User != null && admin.User.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            admins = admins.Where(admin =>
                EF.Functions.ILike(admin.User!.FirstName, $"%{search}%") ||
                EF.Functions.ILike(admin.User.LastName ?? string.Empty, $"%{search}%") ||
                EF.Functions.ILike(admin.User.Email, $"%{search}%"));
        }

        admins = ApplyAdminSort(admins, query);

        var totalCount = await admins.CountAsync(cancellationToken);
        var items = await admins
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Admin>(items, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Admin?> GetAdminAsync(int id, CancellationToken cancellationToken = default)
    {
        return await Admins(true).SingleOrDefaultAsync(admin => admin.Id == id && admin.User != null && admin.User.IsActive, cancellationToken);
    }

    public async Task AddAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default) where TEntity : class
    {
        await _dbContext.Set<TEntity>().AddAsync(entity, cancellationToken);
    }

    public void Update<TEntity>(TEntity entity) where TEntity : class
    {
        _dbContext.Set<TEntity>().Update(entity);
    }

    public void Remove<TEntity>(TEntity entity) where TEntity : class
    {
        _dbContext.Set<TEntity>().Remove(entity);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<User> ApplyUserSort(IQueryable<User> query, PaginationQueryDto request)
    {
        var sortDescending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "firstname" or "first_name" => sortDescending ? query.OrderByDescending(entity => entity.FirstName) : query.OrderBy(entity => entity.FirstName),
            "lastname" or "last_name" => sortDescending ? query.OrderByDescending(entity => entity.LastName) : query.OrderBy(entity => entity.LastName),
            "email" => sortDescending ? query.OrderByDescending(entity => entity.Email) : query.OrderBy(entity => entity.Email),
            "phone" => sortDescending ? query.OrderByDescending(entity => entity.Phone) : query.OrderBy(entity => entity.Phone),
            "role" => sortDescending ? query.OrderByDescending(entity => entity.Role) : query.OrderBy(entity => entity.Role),
            "createdatutc" or "created_at" => sortDescending ? query.OrderByDescending(entity => entity.CreatedAtUtc) : query.OrderBy(entity => entity.CreatedAtUtc),
            _ => sortDescending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }

    private static IQueryable<Teacher> ApplyTeacherSort(IQueryable<Teacher> query, PaginationQueryDto request)
    {
        var sortDescending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "firstname" or "first_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.FirstName) : query.OrderBy(entity => entity.User!.FirstName),
            "lastname" or "last_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.LastName) : query.OrderBy(entity => entity.User!.LastName),
            "email" => sortDescending ? query.OrderByDescending(entity => entity.User!.Email) : query.OrderBy(entity => entity.User!.Email),
            "designation" => sortDescending ? query.OrderByDescending(entity => entity.Designation) : query.OrderBy(entity => entity.Designation),
            _ => sortDescending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }

    private static IQueryable<Student> ApplyStudentSort(IQueryable<Student> query, PaginationQueryDto request)
    {
        var sortDescending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "firstname" or "first_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.FirstName) : query.OrderBy(entity => entity.User!.FirstName),
            "lastname" or "last_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.LastName) : query.OrderBy(entity => entity.User!.LastName),
            "email" => sortDescending ? query.OrderByDescending(entity => entity.User!.Email) : query.OrderBy(entity => entity.User!.Email),
            "studentnumber" or "student_number" => sortDescending ? query.OrderByDescending(entity => entity.StudentNumber) : query.OrderBy(entity => entity.StudentNumber),
            _ => sortDescending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }

    private static IQueryable<Admin> ApplyAdminSort(IQueryable<Admin> query, PaginationQueryDto request)
    {
        var sortDescending = request.SortDirection == SortDirection.Desc;

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "firstname" or "first_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.FirstName) : query.OrderBy(entity => entity.User!.FirstName),
            "lastname" or "last_name" => sortDescending ? query.OrderByDescending(entity => entity.User!.LastName) : query.OrderBy(entity => entity.User!.LastName),
            "email" => sortDescending ? query.OrderByDescending(entity => entity.User!.Email) : query.OrderBy(entity => entity.User!.Email),
            _ => sortDescending ? query.OrderByDescending(entity => entity.Id) : query.OrderBy(entity => entity.Id)
        };
    }
}