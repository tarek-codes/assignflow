using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

public sealed class HealthController : BaseApiController
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Get() => Ok(new
    {
        status = "healthy"
    });

    [Authorize(Roles = nameof(UserRole.Admin))]
    [HttpGet("admin")]
    public IActionResult AdminOnly() => Ok(new
    {
        message = "Admin access granted."
    });

    [Authorize(Roles = nameof(UserRole.Teacher))]
    [HttpGet("teacher")]
    public IActionResult TeacherOnly() => Ok(new
    {
        message = "Teacher access granted."
    });

    [Authorize(Roles = nameof(UserRole.Student))]
    [HttpGet("student")]
    public IActionResult StudentOnly() => Ok(new
    {
        message = "Student access granted."
    });
}