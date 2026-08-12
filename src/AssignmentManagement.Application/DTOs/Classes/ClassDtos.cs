namespace AssignmentManagement.Application.DTOs.Classes;

public class ClassListItemDto
{
    public int Id { get; set; }

    public int ClassLevel { get; set; }

    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public int TeacherId { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public string TeacherEmail { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }
}

public sealed class ClassDetailDto : ClassListItemDto
{
    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class CreateClassRequestDto
{
    public int ClassLevel { get; set; }

    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    public string? Description { get; set; }
}

public sealed class UpdateClassRequestDto
{
    public int ClassLevel { get; set; }

    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    public string? Description { get; set; }
}

public sealed class AssignSubjectRequestDto
{
    public int SubjectId { get; set; }
}

public sealed class AssignTeacherRequestDto
{
    public int TeacherId { get; set; }
}