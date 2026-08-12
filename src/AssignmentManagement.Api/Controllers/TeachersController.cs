using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Teachers;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class TeachersController : BaseApiController
{
    private readonly IUserManagementService _service;

    public TeachersController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TeacherListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetTeachersAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeacherDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var teacher = await _service.GetTeacherAsync(id, cancellationToken);
        return teacher is null ? NotFound() : Ok(teacher);
    }

    [HttpPost]
    public async Task<ActionResult<TeacherDetailDto>> Create([FromBody] CreateTeacherRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateTeacherAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TeacherDetailDto>> Update(int id, [FromBody] UpdateTeacherRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateTeacherAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteTeacherAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}