namespace AssignmentManagement.Application.DTOs.Admins;

public class AdminListItemDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public bool IsActive { get; set; }
}

public sealed class AdminDetailDto : AdminListItemDto
{
}

public sealed class CreateAdminRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }
}

public sealed class UpdateAdminRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }
}