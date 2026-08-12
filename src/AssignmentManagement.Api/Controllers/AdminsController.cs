using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Admins;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminsController : BaseApiController
{
    private readonly IUserManagementService _service;

    public AdminsController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetAdminsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdminDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var admin = await _service.GetAdminAsync(id, cancellationToken);
        return admin is null ? NotFound() : Ok(admin);
    }

    [HttpPost]
    public async Task<ActionResult<AdminDetailDto>> Create([FromBody] CreateAdminRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAdminAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdminDetailDto>> Update(int id, [FromBody] UpdateAdminRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAdminAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAdminAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}