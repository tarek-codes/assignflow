using AssignmentManagement.Application.DTOs.Authentication;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IJwtService
{
    Task<JwtTokenResultDto> GenerateTokensAsync(User user, CancellationToken cancellationToken = default);
}