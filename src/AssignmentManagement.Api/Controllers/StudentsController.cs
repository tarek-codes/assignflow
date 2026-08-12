using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Students;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize]
public sealed class StudentsController : BaseApiController
{
    private readonly IUserManagementService _service;

    public StudentsController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Teacher)}")]
    public async Task<ActionResult<PagedResult<StudentListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetStudentsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Teacher)}")]
    public async Task<ActionResult<StudentDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var student = await _service.GetStudentAsync(id, cancellationToken);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<StudentDetailDto>> Create([FromBody] CreateStudentRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateStudentAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<StudentDetailDto>> Update(int id, [FromBody] UpdateStudentRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateStudentAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteStudentAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}