namespace AssignmentManagement.Application.DTOs.Students;

public class StudentListItemDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string FullName => string.Join(' ', new[] { FirstName, LastName }.Where(part => !string.IsNullOrWhiteSpace(part)));

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    public string Group { get; set; } = "None";

    public string Gender { get; set; } = "Male";

    public bool IsActive { get; set; }
}

public sealed class StudentDetailDto : StudentListItemDto
{
}

public sealed class CreateStudentRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Gender { get; set; } = "Male";

    public string StudentNumber { get; set; } = string.Empty;

    public int ClassLevel { get; set; }
}

public sealed class UpdateStudentRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public int ClassLevel { get; set; }
}