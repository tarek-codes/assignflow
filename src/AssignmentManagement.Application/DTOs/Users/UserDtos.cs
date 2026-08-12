using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs.Users;

public class UserListItemDto
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }
}

public sealed class UserDetailDto : UserListItemDto
{
    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class CreateUserRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public UserRole Role { get; set; }
}

public sealed class UpdateUserRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
}