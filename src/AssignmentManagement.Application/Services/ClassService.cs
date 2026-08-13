using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Application.Mapping;
using AssignmentManagement.Domain.Entities;

using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Services;

public sealed class ClassService : IClassService
{
    private readonly IClassRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;

    public ClassService(IClassRepository repository, ICurrentUserService currentUserService, ICacheService cache)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public Task<PagedResult<ClassListItemDto>> GetClassesAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        int? teacherUserId = _currentUserService.Role == UserRole.Teacher ? _currentUserService.UserId : null;
        return _cache.GetOrSetAsync(
            CacheKeys.Classes(query, teacherUserId),
            async () =>
            {
                var result = await _repository.GetClassesAsync(query, teacherUserId, cancellationToken);
                return new PagedResult<ClassListItemDto>(
                    result.Items.Select(ClassMapping.ToListItemDto).ToList(),
                    result.PageNumber,
                    result.PageSize,
                    result.TotalCount);
            },
            CacheTtl.List,
            cancellationToken);
    }

    public async Task<ClassDetailDto?> GetClassAsync(int id, CancellationToken cancellationToken = default)
    {
        var @class = await _repository.GetClassAsync(id, cancellationToken);
        return @class is null ? null : ClassMapping.ToDetailDto(@class);
    }

    public async Task<ClassDetailDto> CreateClassAsync(CreateClassRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureSubjectExistsAsync(request.SubjectId, cancellationToken);
        await EnsureTeacherExistsAsync(request.TeacherId, cancellationToken);
        await EnsureCombinationAvailableAsync(request.ClassLevel, request.SubjectId, null, cancellationToken);

        var @class = new Class
        {
            ClassLevel = request.ClassLevel,
            SubjectId = request.SubjectId,
            TeacherId = request.TeacherId,
            Description = request.Description,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _repository.AddAsync(@class, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        return await ReloadAndMapAsync(@class.Id, cancellationToken);
    }

    public async Task<ClassDetailDto?> UpdateClassAsync(int id, UpdateClassRequestDto request, CancellationToken cancellationToken = default)
    {
        var @class = await _repository.GetClassAsync(id, cancellationToken);
        if (@class is null)
        {
            return null;
        }

        await EnsureSubjectExistsAsync(request.SubjectId, cancellationToken);
        await EnsureTeacherExistsAsync(request.TeacherId, cancellationToken);
        await EnsureCombinationAvailableAsync(request.ClassLevel, request.SubjectId, @class.Id, cancellationToken);

        @class.ClassLevel = request.ClassLevel;
        @class.SubjectId = request.SubjectId;
        @class.TeacherId = request.TeacherId;
        @class.Description = request.Description;
        @class.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        return await ReloadAndMapAsync(@class.Id, cancellationToken);
    }

    public async Task<ClassDetailDto?> AssignSubjectAsync(int id, AssignSubjectRequestDto request, CancellationToken cancellationToken = default)
    {
        var @class = await _repository.GetClassAsync(id, cancellationToken);
        if (@class is null)
        {
            return null;
        }

        await EnsureSubjectExistsAsync(request.SubjectId, cancellationToken);
        await EnsureCombinationAvailableAsync(@class.ClassLevel, request.SubjectId, @class.Id, cancellationToken);

        @class.SubjectId = request.SubjectId;
        @class.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        return await ReloadAndMapAsync(@class.Id, cancellationToken);
    }

    public async Task<ClassDetailDto?> AssignTeacherAsync(int id, AssignTeacherRequestDto request, CancellationToken cancellationToken = default)
    {
        var @class = await _repository.GetClassAsync(id, cancellationToken);
        if (@class is null)
        {
            return null;
        }

        await EnsureTeacherExistsAsync(request.TeacherId, cancellationToken);

        @class.TeacherId = request.TeacherId;
        @class.UpdatedAtUtc = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);

        return await ReloadAndMapAsync(@class.Id, cancellationToken);
    }

    public async Task<bool> DeleteClassAsync(int id, CancellationToken cancellationToken = default)
    {
        var @class = await _repository.GetClassAsync(id, cancellationToken);
        if (@class is null)
        {
            return false;
        }

        _repository.Remove(@class);
        await _repository.SaveChangesAsync(cancellationToken);
        await CacheInvalidation.OnDashboardDataChangedAsync(_cache, cancellationToken);
        return true;
    }

    private async Task EnsureCombinationAvailableAsync(int classLevel, int subjectId, int? excludeClassId, CancellationToken cancellationToken)
    {
        if (await _repository.HasDuplicateCombinationAsync(classLevel, subjectId, excludeClassId, cancellationToken))
        {
            throw new ConflictException("Class level and subject combination already exists.");
        }
    }

    private async Task EnsureSubjectExistsAsync(int subjectId, CancellationToken cancellationToken)
    {
        if (!await _repository.SubjectExistsAsync(subjectId, cancellationToken))
        {
            throw new NotFoundException("Subject does not exist.");
        }
    }

    private async Task EnsureTeacherExistsAsync(int teacherId, CancellationToken cancellationToken)
    {
        if (!await _repository.TeacherExistsAsync(teacherId, cancellationToken))
        {
            throw new NotFoundException("Teacher does not exist.");
        }
    }

    private async Task<ClassDetailDto> ReloadAndMapAsync(int classId, CancellationToken cancellationToken)
    {
        var @class = await _repository.GetClassAsync(classId, cancellationToken)
            ?? throw new InvalidOperationException("Class could not be reloaded.");

        return ClassMapping.ToDetailDto(@class);
    }
}