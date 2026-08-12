using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Admins;
using AssignmentManagement.Application.DTOs.Students;
using AssignmentManagement.Application.DTOs.Teachers;
using AssignmentManagement.Application.DTOs.Users;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IUserManagementService
{
    Task<PagedResult<UserListItemDto>> GetUsersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<UserDetailDto?> GetUserAsync(int id, CancellationToken cancellationToken = default);

    Task<UserDetailDto> CreateUserAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default);

    Task<UserDetailDto?> UpdateUserAsync(int id, UpdateUserRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteUserAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<TeacherListItemDto>> GetTeachersAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<TeacherDetailDto?> GetTeacherAsync(int id, CancellationToken cancellationToken = default);

    Task<TeacherDetailDto> CreateTeacherAsync(CreateTeacherRequestDto request, CancellationToken cancellationToken = default);

    Task<TeacherDetailDto?> UpdateTeacherAsync(int id, UpdateTeacherRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteTeacherAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<StudentListItemDto>> GetStudentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<StudentDetailDto?> GetStudentAsync(int id, CancellationToken cancellationToken = default);

    Task<StudentDetailDto> CreateStudentAsync(CreateStudentRequestDto request, CancellationToken cancellationToken = default);

    Task<StudentDetailDto?> UpdateStudentAsync(int id, UpdateStudentRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteStudentAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResult<AdminListItemDto>> GetAdminsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default);

    Task<AdminDetailDto?> GetAdminAsync(int id, CancellationToken cancellationToken = default);

    Task<AdminDetailDto> CreateAdminAsync(CreateAdminRequestDto request, CancellationToken cancellationToken = default);

    Task<AdminDetailDto?> UpdateAdminAsync(int id, UpdateAdminRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteAdminAsync(int id, CancellationToken cancellationToken = default);
}