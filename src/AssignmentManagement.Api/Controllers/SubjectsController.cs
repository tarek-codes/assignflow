using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class SubjectsController : BaseApiController
{
    private readonly ISubjectService _service;

    public SubjectsController(ISubjectService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SubjectListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetSubjectsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SubjectDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var subject = await _service.GetSubjectAsync(id, cancellationToken);
        return subject is null ? NotFound() : Ok(subject);
    }

    [HttpPost]
    public async Task<ActionResult<SubjectDetailDto>> Create([FromBody] CreateSubjectRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateSubjectAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SubjectDetailDto>> Update(int id, [FromBody] UpdateSubjectRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateSubjectAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteSubjectAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}