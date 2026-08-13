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
    private readonly ICacheService _cache;

    public DashboardService(
        IDashboardRepository repository,
        ICurrentUserService currentUserService,
        ICacheService cache)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Admin);
        return _cache.GetOrSetAsync(
            CacheKeys.AdminDashboard,
            () => _repository.GetAdminDashboardMetricsAsync(cancellationToken),
            CacheTtl.Dashboard,
            cancellationToken);
    }

    public Task<TeacherDashboardDto> GetTeacherDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Teacher);
        var teacherUserId = GetCurrentUserId();
        return _cache.GetOrSetAsync(
            CacheKeys.TeacherDashboard(teacherUserId),
            () => _repository.GetTeacherDashboardMetricsAsync(teacherUserId, cancellationToken),
            CacheTtl.Dashboard,
            cancellationToken);
    }

    public Task<StudentDashboardDto> GetStudentDashboardAsync(CancellationToken cancellationToken = default)
    {
        EnsureUserInRole(UserRole.Student);
        var studentUserId = GetCurrentUserId();
        return _cache.GetOrSetAsync(
            CacheKeys.StudentDashboard(studentUserId),
            () => _repository.GetStudentDashboardMetricsAsync(studentUserId, cancellationToken),
            CacheTtl.Dashboard,
            cancellationToken);
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
