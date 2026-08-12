using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

public sealed class SubmissionsController : BaseApiController
{
    private readonly ISubmissionService _submissionService;

    public SubmissionsController(ISubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Teacher)}")]
    public async Task<ActionResult<PagedResult<SubmissionListItemDto>>> GetAllSubmissions([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _submissionService.GetAllSubmissionsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpPost("assignments/{assignmentId:int}")]
    [Authorize(Roles = nameof(UserRole.Student))]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<SubmissionDetailDto>> SubmitOrReplace(int assignmentId, [FromForm] SubmitAssignmentRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _submissionService.SubmitOrReplaceAsync(assignmentId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("assignments/{assignmentId:int}/my-submission")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<ActionResult<SubmissionDetailDto>> GetMySubmission(int assignmentId, CancellationToken cancellationToken)
    {
        var submission = await _submissionService.GetMySubmissionAsync(assignmentId, cancellationToken);
        return submission == null ? NotFound() : Ok(submission);
    }

    [HttpGet("my-submissions")]
    [Authorize(Roles = nameof(UserRole.Student))]
    public async Task<ActionResult<PagedResult<SubmissionListItemDto>>> GetMySubmissions([FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _submissionService.GetMySubmissionsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("assignments/{assignmentId:int}")]
    [Authorize(Roles = $"{nameof(UserRole.Teacher)},{nameof(UserRole.Admin)}")]
    public async Task<ActionResult<PagedResult<SubmissionListItemDto>>> GetSubmissionsForAssignment(int assignmentId, [FromQuery] PaginationQueryDto query, CancellationToken cancellationToken)
    {
        var result = await _submissionService.GetSubmissionsForAssignmentAsync(assignmentId, query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<SubmissionDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var submission = await _submissionService.GetSubmissionByIdAsync(id, cancellationToken);
        return submission == null ? NotFound() : Ok(submission);
    }

    [HttpPost("{id:int}/grade")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<SubmissionDetailDto>> Grade(int id, [FromBody] GradeSubmissionRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _submissionService.GradeSubmissionAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<ActionResult<SubmissionDetailDto>> UpdateStatus(int id, [FromBody] UpdateSubmissionStatusRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _submissionService.UpdateSubmissionStatusAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    [HttpGet("{id:int}/preview")]
    [Authorize]
    public async Task<IActionResult> Preview(int id, CancellationToken cancellationToken)
    {
        var result = await _submissionService.GetSubmissionFileStreamAsync(id, isPreview: true, cancellationToken);
        
        Response.Headers["Content-Disposition"] = result.IsInline
            ? $"inline; filename=\"{result.FileName}\""
            : $"attachment; filename=\"{result.FileName}\"";

        return File(result.FileStream, result.ContentType);
    }

    [HttpGet("{id:int}/download")]
    [Authorize]
    public async Task<IActionResult> Download(int id, CancellationToken cancellationToken)
    {
        var result = await _submissionService.GetSubmissionFileStreamAsync(id, isPreview: false, cancellationToken);

        return File(result.FileStream, result.ContentType, result.FileName);
    }
}
