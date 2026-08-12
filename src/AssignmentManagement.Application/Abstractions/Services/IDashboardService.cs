using AssignmentManagement.Application.DTOs.Dashboard;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IDashboardService
{
    Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken cancellationToken = default);

    Task<TeacherDashboardDto> GetTeacherDashboardAsync(CancellationToken cancellationToken = default);

    Task<StudentDashboardDto> GetStudentDashboardAsync(CancellationToken cancellationToken = default);
}
