using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize]
public sealed class ClassesController : BaseApiController
{
    private readonly IClassService _service;

    public ClassesController(IClassService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Teacher)}")]
    public async Task<ActionResult<PagedResult<ClassListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetClassesAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Teacher)}")]
    public async Task<ActionResult<ClassDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var @class = await _service.GetClassAsync(id, cancellationToken);
        return @class is null ? NotFound() : Ok(@class);
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<ClassDetailDto>> Create([FromBody] CreateClassRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateClassAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<ClassDetailDto>> Update(int id, [FromBody] UpdateClassRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateClassAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPatch("{id:int}/assign-subject")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<ClassDetailDto>> AssignSubject(int id, [FromBody] AssignSubjectRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.AssignSubjectAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPatch("{id:int}/assign-teacher")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<ClassDetailDto>> AssignTeacher(int id, [FromBody] AssignTeacherRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.AssignTeacherAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteClassAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}