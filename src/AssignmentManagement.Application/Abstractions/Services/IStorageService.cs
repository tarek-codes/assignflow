using Microsoft.AspNetCore.Http;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IStorageService
{
    void ValidateFile(IFormFile file);

    Task<string> SaveSubmissionFileAsync(int assignmentId, int studentId, IFormFile file, CancellationToken cancellationToken = default);

    Task<(Stream FileStream, string ContentType, string FileName)> GetFileAsync(string relativePath, bool isDownload, CancellationToken cancellationToken = default);

    Task DeleteFileAsync(string relativePath, CancellationToken cancellationToken = default);
}
