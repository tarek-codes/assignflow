using AssignmentManagement.Application.DTOs.Dashboard;

namespace AssignmentManagement.Application.Abstractions.Persistence;

public interface IDashboardRepository
{
    Task<AdminDashboardDto> GetAdminDashboardMetricsAsync(CancellationToken cancellationToken = default);

    Task<TeacherDashboardDto> GetTeacherDashboardMetricsAsync(int teacherUserId, CancellationToken cancellationToken = default);

    Task<StudentDashboardDto> GetStudentDashboardMetricsAsync(int studentUserId, CancellationToken cancellationToken = default);
}
