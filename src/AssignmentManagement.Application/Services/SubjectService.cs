using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Application.Mapping;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Services;

public sealed class SubjectService : ISubjectService
{
    private readonly ISubjectRepository _repository;

    public SubjectService(ISubjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<SubjectListItemDto>> GetSubjectsAsync(PaginationQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetSubjectsAsync(query, cancellationToken);
        return new PagedResult<SubjectListItemDto>(result.Items.Select(SubjectMapping.ToListItemDto).ToList(), result.PageNumber, result.PageSize, result.TotalCount);
    }

    public async Task<SubjectDetailDto?> GetSubjectAsync(int id, CancellationToken cancellationToken = default)
    {
        var subject = await _repository.GetSubjectAsync(id, cancellationToken);
        return subject is null ? null : SubjectMapping.ToDetailDto(subject);
    }

    public async Task<SubjectDetailDto> CreateSubjectAsync(CreateSubjectRequestDto request, CancellationToken cancellationToken = default)
    {
        await EnsureUniqueAsync(request.SubjectName, request.SubjectCode, null, cancellationToken);

        var subject = new Subject
        {
            SubjectName = request.SubjectName,
            SubjectCode = string.IsNullOrWhiteSpace(request.SubjectCode) ? null : request.SubjectCode,
            Description = request.Description
        };

        await _repository.AddAsync(subject, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return SubjectMapping.ToDetailDto(subject);
    }

    public async Task<SubjectDetailDto?> UpdateSubjectAsync(int id, UpdateSubjectRequestDto request, CancellationToken cancellationToken = default)
    {
        var subject = await _repository.GetSubjectAsync(id, cancellationToken);
        if (subject is null)
        {
            return null;
        }

        await EnsureUniqueAsync(request.SubjectName, request.SubjectCode, subject.Id, cancellationToken);

        subject.SubjectName = request.SubjectName;
        subject.SubjectCode = string.IsNullOrWhiteSpace(request.SubjectCode) ? null : request.SubjectCode;
        subject.Description = request.Description;

        await _repository.SaveChangesAsync(cancellationToken);

        return SubjectMapping.ToDetailDto(subject);
    }

    public async Task<bool> DeleteSubjectAsync(int id, CancellationToken cancellationToken = default)
    {
        var subject = await _repository.GetSubjectAsync(id, cancellationToken);
        if (subject is null)
        {
            return false;
        }

        if (await _repository.HasClassesAsync(id, cancellationToken))
        {
            throw new ConflictException("Subject cannot be deleted because it is assigned to one or more classes.");
        }

        _repository.Remove(subject);
        await _repository.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task EnsureUniqueAsync(string subjectName, string? subjectCode, int? excludeSubjectId, CancellationToken cancellationToken)
    {
        if (await _repository.NameExistsAsync(subjectName, excludeSubjectId, cancellationToken))
        {
            throw new ConflictException("Subject name already exists.");
        }

        if (!string.IsNullOrWhiteSpace(subjectCode) && await _repository.CodeExistsAsync(subjectCode, excludeSubjectId, cancellationToken))
        {
            throw new ConflictException("Subject code already exists.");
        }
    }
}