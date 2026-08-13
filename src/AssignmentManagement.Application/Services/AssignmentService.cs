using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Application.Mapping;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services;

public sealed class AssignmentService : IAssignmentService
{
    private readonly IAssignmentRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(
        IAssignmentRepository repository,
        ICurrentUserService currentUserService,
        ICacheService cache,
        ILogger<AssignmentService> logger)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _cache = cache;
        _logger = logger;
    }

    public Task<PagedResult<AssignmentListItemDto>> GetAssignmentsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        int? teacherUserId = _currentUserService.Role == UserRole.Teacher ? _currentUserService.UserId : null;
        return _cache.GetOrSetAsync(
            CacheKeys.Assignments(query, teacherUserId),
            async () =>
            {
                var result = await _repository.GetAssignmentsAsync(teacherUserId, query, cancellationToken);
                return new PagedResult<AssignmentListItemDto>(
                    result.Items.Select(AssignmentMapping.ToListItemDto).ToList(),
                    result.PageNumber,
                    result.PageSize,
                    result.TotalCount);
            },
            CacheTtl.List,
            cancellationToken);
    }

    public async Task<AssignmentDetailDto?> GetAssignmentAsync(int id, CancellationToken cancellationToken = default)
    {
        var assignment = await _repository.GetAssignmentAsync(id, cancellationToken: cancellationToken);
        if (assignment is null)
        {
            return null;
        }

        if (_currentUserService.Role == UserRole.Teacher)
        {
            EnsureOwnership(assignment, GetCurrentTeacherUserId());
        }
        return AssignmentMapping.ToDetailDto(assignment);
    }

    public async Task<AssignmentDetailDto> CreateAssignmentAsync(CreateAssignmentRequestDto request, CancellationToken cancellationToken = default)
    {
        var teacherUserId = GetCurrentTeacherUserId();
        var classEntity = await _repository.GetClassAsync(request.ClassId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Class not found.");

        EnsureOwnership(classEntity, teacherUserId);

        var assignment = new Assignment
        {
            ClassId = request.ClassId,
            Title = request.Title,
            Description = request.Description,
            Instructions = request.Instructions,
            DeadlineUtc = request.DeadlineUtc,
            MaxMarks = request.MaxMarks,
            AllowResubmission = request.AllowResubmission,
            Status = AssignmentStatus.Draft,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        await _repository.AddAsync(assignment, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Assignment {AssignmentId} '{Title}' created for Class {ClassId} by Teacher User {TeacherUserId}", assignment.Id, assignment.Title, assignment.ClassId, teacherUserId);

        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        // Re-fetch with navigation properties for proper DTO mapping
        var created = await _repository.GetAssignmentAsync(assignment.Id, cancellationToken: cancellationToken) ?? assignment;
        return AssignmentMapping.ToDetailDto(created);
    }

    public async Task<AssignmentDetailDto?> UpdateAssignmentAsync(int id, UpdateAssignmentRequestDto request, CancellationToken cancellationToken = default)
    {
        var teacherUserId = GetCurrentTeacherUserId();
        var assignment = await _repository.GetAssignmentAsync(id, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwnership(assignment, teacherUserId);

        var classEntity = await _repository.GetClassAsync(request.ClassId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Class not found.");

        EnsureOwnership(classEntity, teacherUserId);

        assignment.ClassId = request.ClassId;
        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.Instructions = request.Instructions;
        assignment.DeadlineUtc = request.DeadlineUtc;
        assignment.MaxMarks = request.MaxMarks;
        assignment.AllowResubmission = request.AllowResubmission;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Assignment {AssignmentId} '{Title}' updated by Teacher User {TeacherUserId}", assignment.Id, assignment.Title, teacherUserId);

        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        assignment.Class = classEntity;
        return AssignmentMapping.ToDetailDto(assignment);
    }

    public async Task<AssignmentDetailDto?> PublishAssignmentAsync(int id, CancellationToken cancellationToken = default)
    {
        var teacherUserId = GetCurrentTeacherUserId();
        var assignment = await _repository.GetAssignmentAsync(id, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwnership(assignment, teacherUserId);
        EnsurePublishable(assignment);

        assignment.Status = AssignmentStatus.Published;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);
        return AssignmentMapping.ToDetailDto(assignment);
    }

    public async Task<AssignmentDetailDto?> SaveDraftAsync(int id, CancellationToken cancellationToken = default)
    {
        var teacherUserId = GetCurrentTeacherUserId();
        var assignment = await _repository.GetAssignmentAsync(id, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwnership(assignment, teacherUserId);

        assignment.Status = AssignmentStatus.Draft;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);
        return AssignmentMapping.ToDetailDto(assignment);
    }

    public async Task<bool> DeleteAssignmentAsync(int id, CancellationToken cancellationToken = default)
    {
        var teacherUserId = GetCurrentTeacherUserId();
        var assignment = await _repository.GetAssignmentAsync(id, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwnership(assignment, teacherUserId);

        _repository.Remove(assignment);
        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);
        return true;
    }

    private int GetCurrentTeacherUserId()
    {
        if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        return _currentUserService.UserId.Value;
    }

    private void EnsureOwnership(Assignment assignment, int teacherUserId)
    {
        if (_currentUserService.Role == UserRole.Teacher && assignment.Class?.Teacher?.UserId != teacherUserId)
        {
            throw new ForbiddenException("You can only manage assignments for your assigned classes.");
        }
    }

    private void EnsureOwnership(Class classEntity, int teacherUserId)
    {
        if (_currentUserService.Role == UserRole.Teacher && classEntity.Teacher?.UserId != teacherUserId)
        {
            throw new ForbiddenException("You can only manage assignments for your assigned classes.");
        }
    }

    private static void EnsurePublishable(Assignment assignment)
    {
        if (assignment.DeadlineUtc <= DateTime.UtcNow)
        {
            throw new ConflictException("Assignment deadline must be in the future before publishing.");
        }

        if (assignment.MaxMarks <= 0)
        {
            throw new ConflictException("Maximum marks must be greater than zero before publishing.");
        }
    }
}