using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.DTOs.Dashboard;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Route("api/dashboard")]
public sealed class DashboardsController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardsController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("admin")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<AdminDashboardDto>> GetAdminDashboard(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetAdminDashboardAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("teacher")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<TeacherDashboardDto>> GetTeacherDashboard(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetTeacherDashboardAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("student")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<ActionResult<StudentDashboardDto>> GetStudentDashboard(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetStudentDashboardAsync(cancellationToken);
        return Ok(result);
    }
}
