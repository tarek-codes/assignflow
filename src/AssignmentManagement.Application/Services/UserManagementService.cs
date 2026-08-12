using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Admins;
using AssignmentManagement.Application.DTOs.Students;
using AssignmentManagement.Application.DTOs.Teachers;
using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using System.Linq;

namespace AssignmentManagement.Application.Services;

public sealed class UserManagementService : IUserManagementService
{
    private readonly IUserManagementRepository _repository;
    private readonly IPasswordHasher _passwordHasher;

    public UserManagementService(IUserManagementRepository repository, IPasswordHasher passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<UserListItemDto>> GetUsersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetUsersAsync(query, cancellationToken);
        return new PagedResult<UserListItemDto>(result.Items.Select(MapUserListItem).ToList(), result.PageNumber, result.PageSize, result.TotalCount);
    }

    public async Task<UserDetailDto?> GetUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetUserAsync(id, cancellationToken);
        return user is null ? null : MapUserDetail(user);
    }

    public async Task<UserDetailDto> CreateUserAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureEmailAvailableAsync(request.Email, null, cancellationToken);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            Role = request.Role,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _repository.AddAsync(user, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return MapUserDetail(user);
    }

    public async Task<UserDetailDto?> UpdateUserAsync(int id, UpdateUserRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetUserAsync(id, cancellationToken);
        if (user is null)
        {
            return null;
        }

        await EnsureEmailAvailableAsync(request.Email, user.Id, cancellationToken);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        return MapUserDetail(user);
    }

    public async Task<bool> DeleteUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetUserAsync(id, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.IsActive = false;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PagedResult<TeacherListItemDto>> GetTeachersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetTeachersAsync(query, cancellationToken);
        return new PagedResult<TeacherListItemDto>(result.Items.Select(MapTeacherListItem).ToList(), result.PageNumber, result.PageSize, result.TotalCount);
    }

    public async Task<TeacherDetailDto?> GetTeacherAsync(int id, CancellationToken cancellationToken = default)
    {
        var teacher = await _repository.GetTeacherAsync(id, cancellationToken);
        return teacher is null ? null : MapTeacherDetail(teacher);
    }

    public async Task<TeacherDetailDto> CreateTeacherAsync(CreateTeacherRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureEmailAvailableAsync(request.Email, null, cancellationToken);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            Gender = string.IsNullOrWhiteSpace(request.Gender) ? "Male" : request.Gender,
            Role = UserRole.Teacher,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _repository.AddAsync(user, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var teacher = new Teacher
        {
            UserId = user.Id,
            Designation = request.Designation
        };

        await _repository.AddAsync(teacher, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var subjectsToLink = new List<Subject>();

        if (request.TaughtSubjects != null && request.TaughtSubjects.Count > 0)
        {
            var existingSubjects = await _repository.GetAllSubjectsAsync(cancellationToken);

            foreach (var subjectName in request.TaughtSubjects)
            {
                if (string.IsNullOrWhiteSpace(subjectName)) continue;
                var trimmed = subjectName.Trim();
                var subj = existingSubjects.FirstOrDefault(s => s.SubjectName.Equals(trimmed, StringComparison.OrdinalIgnoreCase));
                if (subj == null)
                {
                    subj = new Subject
                    {
                        SubjectName = trimmed,
                        SubjectCode = trimmed.Length >= 3 ? trimmed.Substring(0, 3).ToUpper() : "SUB",
                        Description = $"{trimmed} Curriculum Subject"
                    };
                    await _repository.AddAsync(subj, cancellationToken);
                    await _repository.SaveChangesAsync(cancellationToken);
                    existingSubjects.Add(subj);
                }
                subjectsToLink.Add(subj);
            }
        }

        if (subjectsToLink.Count > 0)
        {
            foreach (var subj in subjectsToLink)
            {
                await _repository.AddAsync(new TeacherSubject { TeacherId = teacher.Id, SubjectId = subj.Id }, cancellationToken);
            }
            await _repository.SaveChangesAsync(cancellationToken);
        }
        else if (request.SubjectIds.Count > 0)
        {
            foreach (var subjectId in request.SubjectIds)
            {
                await _repository.AddAsync(new TeacherSubject { TeacherId = teacher.Id, SubjectId = subjectId }, cancellationToken);
            }
            await _repository.SaveChangesAsync(cancellationToken);
        }

        teacher.User = user;
        return MapTeacherDetail(teacher);
    }

    public async Task<TeacherDetailDto?> UpdateTeacherAsync(int id, UpdateTeacherRequestDto request, CancellationToken cancellationToken = default)
    {
        var teacher = await _repository.GetTeacherAsync(id, cancellationToken);
        if (teacher is null || teacher.User is null)
        {
            return null;
        }

        await EnsureEmailAvailableAsync(request.Email, teacher.UserId, cancellationToken);

        teacher.User.FirstName = request.FirstName;
        teacher.User.LastName = request.LastName;
        teacher.User.Email = request.Email;
        teacher.User.Phone = request.Phone;
        teacher.User.UpdatedAtUtc = DateTime.UtcNow;
        teacher.Designation = request.Designation;

        await _repository.SaveChangesAsync(cancellationToken);

        return MapTeacherDetail(teacher);
    }

    public async Task<bool> DeleteTeacherAsync(int id, CancellationToken cancellationToken = default)
    {
        var teacher = await _repository.GetTeacherAsync(id, cancellationToken);
        if (teacher is null || teacher.User is null)
        {
            return false;
        }

        teacher.User.IsActive = false;
        teacher.User.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PagedResult<StudentListItemDto>> GetStudentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetStudentsAsync(query, cancellationToken);
        return new PagedResult<StudentListItemDto>(result.Items.Select(MapStudentListItem).ToList(), result.PageNumber, result.PageSize, result.TotalCount);
    }

    public async Task<StudentDetailDto?> GetStudentAsync(int id, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetStudentAsync(id, cancellationToken);
        return student is null ? null : MapStudentDetail(student);
    }

    public async Task<StudentDetailDto> CreateStudentAsync(CreateStudentRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureEmailAvailableAsync(request.Email, null, cancellationToken);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            Gender = string.IsNullOrWhiteSpace(request.Gender) ? "Male" : request.Gender,
            Role = UserRole.Student,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _repository.AddAsync(user, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var student = new Student
        {
            UserId = user.Id,
            StudentNumber = request.StudentNumber,
            ClassLevel = request.ClassLevel
        };

        await _repository.AddAsync(student, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        student.User = user;
        return MapStudentDetail(student);
    }

    public async Task<StudentDetailDto?> UpdateStudentAsync(int id, UpdateStudentRequestDto request, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetStudentAsync(id, cancellationToken);
        if (student is null || student.User is null)
        {
            return null;
        }

        await EnsureEmailAvailableAsync(request.Email, student.UserId, cancellationToken);

        student.User.FirstName = request.FirstName;
        student.User.LastName = request.LastName;
        student.User.Email = request.Email;
        student.User.Phone = request.Phone;
        student.User.UpdatedAtUtc = DateTime.UtcNow;
        student.StudentNumber = request.StudentNumber;
        student.ClassLevel = request.ClassLevel;

        await _repository.SaveChangesAsync(cancellationToken);

        return MapStudentDetail(student);
    }

    public async Task<bool> DeleteStudentAsync(int id, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetStudentAsync(id, cancellationToken);
        if (student is null || student.User is null)
        {
            return false;
        }

        student.User.IsActive = false;
        student.User.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PagedResult<AdminListItemDto>> GetAdminsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetAdminsAsync(query, cancellationToken);
        return new PagedResult<AdminListItemDto>(result.Items.Select(MapAdminListItem).ToList(), result.PageNumber, result.PageSize, result.TotalCount);
    }

    public async Task<AdminDetailDto?> GetAdminAsync(int id, CancellationToken cancellationToken = default)
    {
        var admin = await _repository.GetAdminAsync(id, cancellationToken);
        return admin is null ? null : MapAdminDetail(admin);
    }

    public async Task<AdminDetailDto> CreateAdminAsync(CreateAdminRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureEmailAvailableAsync(request.Email, null, cancellationToken);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _repository.AddAsync(user, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var admin = new Admin
        {
            UserId = user.Id
        };

        await _repository.AddAsync(admin, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        admin.User = user;
        return MapAdminDetail(admin);
    }

    public async Task<AdminDetailDto?> UpdateAdminAsync(int id, UpdateAdminRequestDto request, CancellationToken cancellationToken = default)
    {
        var admin = await _repository.GetAdminAsync(id, cancellationToken);
        if (admin is null || admin.User is null)
        {
            return null;
        }

        await EnsureEmailAvailableAsync(request.Email, admin.UserId, cancellationToken);

        admin.User.FirstName = request.FirstName;
        admin.User.LastName = request.LastName;
        admin.User.Email = request.Email;
        admin.User.Phone = request.Phone;
        admin.User.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        return MapAdminDetail(admin);
    }

    public async Task<bool> DeleteAdminAsync(int id, CancellationToken cancellationToken = default)
    {
        var admin = await _repository.GetAdminAsync(id, cancellationToken);
        if (admin is null || admin.User is null)
        {
            return false;
        }

        admin.User.IsActive = false;
        admin.User.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task EnsureEmailAvailableAsync(string email, int? excludeUserId, CancellationToken cancellationToken)
    {
        if (await _repository.EmailExistsAsync(email, excludeUserId, cancellationToken))
        {
            throw new ConflictException("Email already exists.");
        }
    }

    private static UserListItemDto MapUserListItem(User user)
    {
        return new UserListItemDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }

    private static UserDetailDto MapUserDetail(User user)
    {
        return new UserDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAtUtc = user.CreatedAtUtc,
            UpdatedAtUtc = user.UpdatedAtUtc
        };
    }

    private static TeacherListItemDto MapTeacherListItem(Teacher teacher)
    {
        return new TeacherListItemDto
        {
            Id = teacher.Id,
            UserId = teacher.UserId,
            FirstName = teacher.User?.FirstName ?? string.Empty,
            LastName = teacher.User?.LastName,
            Email = teacher.User?.Email ?? string.Empty,
            Phone = teacher.User?.Phone,
            Designation = teacher.Designation,
            Gender = teacher.User?.Gender ?? "Male",
            TaughtSubjects = teacher.TeacherSubjects
                .Select(ts => ts.Subject?.SubjectName ?? string.Empty)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList(),
            IsActive = teacher.User?.IsActive ?? false
        };
    }

    private static TeacherDetailDto MapTeacherDetail(Teacher teacher)
    {
        return new TeacherDetailDto
        {
            Id = teacher.Id,
            UserId = teacher.UserId,
            FirstName = teacher.User?.FirstName ?? string.Empty,
            LastName = teacher.User?.LastName,
            Email = teacher.User?.Email ?? string.Empty,
            Phone = teacher.User?.Phone,
            Designation = teacher.Designation,
            Gender = teacher.User?.Gender ?? "Male",
            TaughtSubjects = teacher.TeacherSubjects
                .Select(ts => ts.Subject?.SubjectName ?? string.Empty)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList(),
            IsActive = teacher.User?.IsActive ?? false
        };
    }

    private static StudentListItemDto MapStudentListItem(Student student)
    {
        return new StudentListItemDto
        {
            Id = student.Id,
            UserId = student.UserId,
            FirstName = student.User?.FirstName ?? string.Empty,
            LastName = student.User?.LastName,
            Email = student.User?.Email ?? string.Empty,
            Phone = student.User?.Phone,
            StudentNumber = student.StudentNumber,
            ClassLevel = student.ClassLevel,
            Group = student.Group ?? "None",
            Gender = student.User?.Gender ?? "Male",
            IsActive = student.User?.IsActive ?? false
        };
    }

    private static StudentDetailDto MapStudentDetail(Student student)
    {
        return new StudentDetailDto
        {
            Id = student.Id,
            UserId = student.UserId,
            FirstName = student.User?.FirstName ?? string.Empty,
            LastName = student.User?.LastName,
            Email = student.User?.Email ?? string.Empty,
            Phone = student.User?.Phone,
            StudentNumber = student.StudentNumber,
            ClassLevel = student.ClassLevel,
            Group = student.Group ?? "None",
            Gender = student.User?.Gender ?? "Male",
            IsActive = student.User?.IsActive ?? false
        };
    }

    private static AdminListItemDto MapAdminListItem(Admin admin)
    {
        return new AdminListItemDto
        {
            Id = admin.Id,
            UserId = admin.UserId,
            FirstName = admin.User?.FirstName ?? string.Empty,
            LastName = admin.User?.LastName,
            Email = admin.User?.Email ?? string.Empty,
            Phone = admin.User?.Phone,
            IsActive = admin.User?.IsActive ?? false
        };
    }

    private static AdminDetailDto MapAdminDetail(Admin admin)
    {
        return new AdminDetailDto
        {
            Id = admin.Id,
            UserId = admin.UserId,
            FirstName = admin.User?.FirstName ?? string.Empty,
            LastName = admin.User?.LastName,
            Email = admin.User?.Email ?? string.Empty,
            Phone = admin.User?.Phone,
            IsActive = admin.User?.IsActive ?? false
        };
    }
}