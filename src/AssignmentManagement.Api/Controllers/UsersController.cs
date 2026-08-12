using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class UsersController : BaseApiController
{
    private readonly IUserManagementService _service;

    public UsersController(IUserManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> GetAll([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _service.GetUsersAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await _service.GetUserAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDetailDto>> Create([FromBody] CreateUserRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateUserAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserDetailDto>> Update(int id, [FromBody] UpdateUserRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateUserAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteUserAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}