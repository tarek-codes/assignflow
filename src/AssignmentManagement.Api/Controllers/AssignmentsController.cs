using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize]
public sealed class AssignmentsController : BaseApiController
{
    private readonly IAssignmentService _service;

    public AssignmentsController(IAssignmentService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(UserRole.Teacher)},{nameof(UserRole.Admin)},{nameof(UserRole.Student)}")]
    public async Task<ActionResult<PagedResult<AssignmentListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetAssignmentsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{nameof(UserRole.Teacher)},{nameof(UserRole.Admin)},{nameof(UserRole.Student)}")]
    public async Task<ActionResult<AssignmentDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var assignment = await _service.GetAssignmentAsync(id, cancellationToken);
        return assignment is null ? NotFound() : Ok(assignment);
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<AssignmentDetailDto>> Create([FromBody] CreateAssignmentRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAssignmentAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<AssignmentDetailDto>> Update(int id, [FromBody] UpdateAssignmentRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAssignmentAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:int}/publish")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<AssignmentDetailDto>> Publish(int id, CancellationToken cancellationToken)
    {
        var updated = await _service.PublishAssignmentAsync(id, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:int}/draft")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<AssignmentDetailDto>> SaveDraft(int id, CancellationToken cancellationToken)
    {
        var updated = await _service.SaveDraftAsync(id, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAssignmentAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}