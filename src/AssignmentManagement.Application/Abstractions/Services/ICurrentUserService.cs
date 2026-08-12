using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }

    int? UserId { get; }

    string? Email { get; }

    string? FullName { get; }

    UserRole? Role { get; }
}