namespace AssignmentManagement.Application.DTOs.Teachers;

public class TeacherListItemDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string FullName => string.Join(' ', new[] { FirstName, LastName }.Where(part => !string.IsNullOrWhiteSpace(part)));

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Designation { get; set; }

    public string Gender { get; set; } = "Male";

    public List<string> TaughtSubjects { get; set; } = [];

    public bool IsActive { get; set; }
}

public sealed class TeacherDetailDto : TeacherListItemDto
{
}

public sealed class CreateTeacherRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Gender { get; set; } = "Male";

    public string? Designation { get; set; }

    public List<int> SubjectIds { get; set; } = [];

    public List<string> TaughtSubjects { get; set; } = [];
}

public sealed class UpdateTeacherRequestDto
{
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Designation { get; set; }

    public List<int> SubjectIds { get; set; } = [];
}