using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Dashboard;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public DashboardService(IDashboardRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Admin);
        return await _repository.GetAdminDashboardMetricsAsync(cancellationToken);
    }

    public async Task<TeacherDashboardDto> GetTeacherDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Teacher);
        var teacherUserId = GetCurrentUserId();
        return await _repository.GetTeacherDashboardMetricsAsync(teacherUserId, cancellationToken);
    }

    public async Task<StudentDashboardDto> GetStudentDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Student);
        var studentUserId = GetCurrentUserId();
        return await _repository.GetStudentDashboardMetricsAsync(studentUserId, cancellationToken);
    }

    private int GetCurrentUserId()
    {
        if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        return _currentUserService.UserId.Value;
    }

    private void EnsureUserInRole(UserRole requiredRole)
    {
        if (!_currentUserService.IsAuthenticated)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        if (_currentUserService.Role != requiredRole)
        {
            throw new ForbiddenException($"Access restricted to users with '{requiredRole}' role.");
        }
    }
}
