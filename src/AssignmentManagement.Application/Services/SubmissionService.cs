using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Application.Mapping;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services;

public sealed class SubmissionService : ISubmissionService
{
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly IStorageService _storageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;
    private readonly ILogger<SubmissionService> _logger;

    public SubmissionService(
        ISubmissionRepository submissionRepository,
        IAssignmentRepository assignmentRepository,
        IStorageService storageService,
        ICurrentUserService currentUserService,
        ICacheService cache,
        ILogger<SubmissionService> logger)
    {
        _submissionRepository = submissionRepository;
        _assignmentRepository = assignmentRepository;
        _storageService = storageService;
        _currentUserService = currentUserService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<SubmissionDetailDto> SubmitOrReplaceAsync(int assignmentId, SubmitAssignmentRequestDto request, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        var student = await _submissionRepository.GetStudentByUserIdAsync(currentUserId, cancellationToken)
            ?? throw new NotFoundException("Student profile not found for current user.");

        var assignment = await _assignmentRepository.GetAssignmentAsync(assignmentId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.Status != AssignmentStatus.Published)
        {
            throw new ConflictException("Assignment is not published and not accepting submissions.");
        }

        if (DateTime.UtcNow > assignment.DeadlineUtc)
        {
            throw new ConflictException("Assignment deadline has passed. Submissions are no longer accepted.");
        }

        var isEnrolled = await _submissionRepository.IsStudentEnrolledInAssignmentClassAsync(student.Id, assignmentId, cancellationToken);
        if (!isEnrolled)
        {
            throw new ForbiddenException("You are not enrolled in the class for this assignment.");
        }

        _storageService.ValidateFile(request.File);

        var existingSubmission = await _submissionRepository.GetByAssignmentAndStudentAsync(assignmentId, student.Id, tracking: true, cancellationToken);

        if (existingSubmission != null)
        {
            if (!assignment.AllowResubmission)
            {
                throw new ConflictException("Resubmission is not allowed for this assignment.");
            }

            if (!string.IsNullOrWhiteSpace(existingSubmission.FileUrl))
            {
                await _storageService.DeleteFileAsync(existingSubmission.FileUrl, cancellationToken);
            }

            var newFilePath = await _storageService.SaveSubmissionFileAsync(assignmentId, student.Id, request.File, cancellationToken);
            existingSubmission.FileUrl = newFilePath;
            existingSubmission.SubmissionText = request.SubmissionText;
            existingSubmission.SubmittedAtUtc = DateTime.UtcNow;
            existingSubmission.Status = SubmissionStatus.Submitted;
            existingSubmission.UpdatedAtUtc = DateTime.UtcNow;
        }
        else
        {
            var newFilePath = await _storageService.SaveSubmissionFileAsync(assignmentId, student.Id, request.File, cancellationToken);
            existingSubmission = new Submission
            {
                AssignmentId = assignmentId,
                StudentId = student.Id,
                SubmissionText = request.SubmissionText,
                FileUrl = newFilePath,
                SubmittedAtUtc = DateTime.UtcNow,
                Status = SubmissionStatus.Submitted,
                UpdatedAtUtc = DateTime.UtcNow
            };

            await _submissionRepository.AddAsync(existingSubmission, cancellationToken);
        }

        await _submissionRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Submission {SubmissionId} uploaded for Assignment {AssignmentId} by Student {StudentId} (User {UserId})", existingSubmission.Id, assignmentId, student.Id, currentUserId);

        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        var reloaded = await _submissionRepository.GetByIdAsync(existingSubmission.Id, cancellationToken: cancellationToken);
        return SubmissionMapping.ToDetailDto(reloaded ?? existingSubmission);
    }

    public async Task<SubmissionDetailDto?> GetMySubmissionAsync(int assignmentId, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        var student = await _submissionRepository.GetStudentByUserIdAsync(currentUserId, cancellationToken);
        if (student == null) return null;

        var submission = await _submissionRepository.GetByAssignmentAndStudentAsync(assignmentId, student.Id, cancellationToken: cancellationToken);
        return submission == null ? null : SubmissionMapping.ToDetailDto(submission);
    }

    public Task<PagedResult<SubmissionListItemDto>> GetMySubmissionsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        return _cache.GetOrSetAsync(
            CacheKeys.MySubmissions(currentUserId, query),
            async () =>
            {
                var pagedResult = await _submissionRepository.GetSubmissionsByStudentUserAsync(currentUserId, query, cancellationToken);
                return new PagedResult<SubmissionListItemDto>(
                    pagedResult.Items.Select(SubmissionMapping.ToListItemDto).ToList(),
                    pagedResult.PageNumber,
                    pagedResult.PageSize,
                    pagedResult.TotalCount);
            },
            CacheTtl.List,
            cancellationToken);
    }

    public async Task<PagedResult<SubmissionListItemDto>> GetSubmissionsForAssignmentAsync(int assignmentId, PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        var assignment = await _assignmentRepository.GetAssignmentAsync(assignmentId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");

        if (_currentUserService.Role == UserRole.Teacher && assignment.Class?.Teacher?.UserId != currentUserId)
        {
            throw new ForbiddenException("You can only view submissions for assignments in your assigned classes.");
        }

        var pagedResult = await _submissionRepository.GetSubmissionsByAssignmentAsync(assignmentId, query, cancellationToken);
        return new PagedResult<SubmissionListItemDto>(
            pagedResult.Items.Select(SubmissionMapping.ToListItemDto).ToList(),
            pagedResult.PageNumber,
            pagedResult.PageSize,
            pagedResult.TotalCount);
    }

    public Task<PagedResult<SubmissionListItemDto>> GetAllSubmissionsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        int? teacherUserId = _currentUserService.Role == UserRole.Teacher ? _currentUserService.UserId : null;
        return _cache.GetOrSetAsync(
            CacheKeys.Submissions(query, teacherUserId),
            async () =>
            {
                var pagedResult = await _submissionRepository.GetAllSubmissionsAsync(query, teacherUserId, cancellationToken);
                return new PagedResult<SubmissionListItemDto>(
                    pagedResult.Items.Select(SubmissionMapping.ToListItemDto).ToList(),
                    pagedResult.PageNumber,
                    pagedResult.PageSize,
                    pagedResult.TotalCount);
            },
            CacheTtl.List,
            cancellationToken);
    }

    public async Task<SubmissionDetailDto?> GetSubmissionByIdAsync(int submissionId, CancellationToken cancellationToken = default)
    {
        var submission = await _submissionRepository.GetByIdAsync(submissionId, cancellationToken: cancellationToken);
        if (submission == null) return null;

        EnsureAccessPermission(submission);
        return SubmissionMapping.ToDetailDto(submission);
    }

    public async Task<SubmissionDetailDto> GradeSubmissionAsync(int submissionId, GradeSubmissionRequestDto request, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        var submission = await _submissionRepository.GetByIdAsync(submissionId, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Submission not found.");

        if (_currentUserService.Role == UserRole.Teacher && submission.Assignment?.Class?.Teacher?.UserId != currentUserId)
        {
            throw new ForbiddenException("You can only grade submissions for your assigned classes.");
        }

        if (submission.Status == SubmissionStatus.Graded)
        {
            throw new ConflictException("This submission has already been graded. Grades are final and cannot be modified.");
        }

        var maxMarks = submission.Assignment?.MaxMarks ?? 0;
        if (request.Marks < 0 || (maxMarks > 0 && request.Marks > maxMarks))
        {
            throw new ConflictException($"Marks must be between 0 and the maximum mark limit of {maxMarks}.");
        }

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback;
        submission.Status = request.Status ?? SubmissionStatus.Graded;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        await _submissionRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Submission {SubmissionId} graded with {Marks}/{MaxMarks} marks by User {TeacherUserId}", submissionId, request.Marks, maxMarks, currentUserId);

        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        var reloaded = await _submissionRepository.GetByIdAsync(submissionId, cancellationToken: cancellationToken);
        return SubmissionMapping.ToDetailDto(reloaded ?? submission);
    }

    public async Task<SubmissionDetailDto> UpdateSubmissionStatusAsync(int submissionId, UpdateSubmissionStatusRequestDto request, CancellationToken cancellationToken = default)
    {
        var currentUserId = GetCurrentUserId();
        var submission = await _submissionRepository.GetByIdAsync(submissionId, tracking: true, cancellationToken)
            ?? throw new NotFoundException("Submission not found.");

        if (_currentUserService.Role == UserRole.Teacher && submission.Assignment?.Class?.Teacher?.UserId != currentUserId)
        {
            throw new ForbiddenException("You can only update submission status for your assigned classes.");
        }

        submission.Status = request.Status;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        await _submissionRepository.SaveChangesAsync(cancellationToken);

        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        var reloaded = await _submissionRepository.GetByIdAsync(submissionId, cancellationToken: cancellationToken);
        return SubmissionMapping.ToDetailDto(reloaded ?? submission);
    }

    public async Task<FileStreamResultDto> GetSubmissionFileStreamAsync(int submissionId, bool isPreview, CancellationToken cancellationToken = default)
    {
        var submission = await _submissionRepository.GetByIdAsync(submissionId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Submission not found.");

        EnsureAccessPermission(submission);

        var fileUrlToUse = string.IsNullOrWhiteSpace(submission.FileUrl) ? "sample_solution.pdf" : submission.FileUrl;
        var (stream, contentType, fileName) = await _storageService.GetFileAsync(fileUrlToUse, isDownload: !isPreview, cancellationToken);

        return new FileStreamResultDto
        {
            FileStream = stream,
            ContentType = contentType,
            FileName = fileName,
            IsInline = isPreview && contentType == "application/pdf"
        };
    }

    private int GetCurrentUserId()
    {
        if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        return _currentUserService.UserId.Value;
    }

    private void EnsureAccessPermission(Submission submission)
    {
        var currentUserId = GetCurrentUserId();
        var userRole = _currentUserService.Role;

        if (userRole == UserRole.Admin)
        {
            return;
        }

        if (userRole == UserRole.Teacher && submission.Assignment?.Class?.Teacher?.UserId == currentUserId)
        {
            return;
        }

        if (userRole == UserRole.Student && submission.Student?.UserId == currentUserId)
        {
            return;
        }

        throw new ForbiddenException("You do not have permission to view or access this submission.");
    }
}
