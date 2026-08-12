namespace AssignmentManagement.Application.DTOs.Subjects;

public class SubjectListItemDto
{
    public int Id { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public string? Description { get; set; }
}

public sealed class SubjectDetailDto : SubjectListItemDto
{
}

public sealed class CreateSubjectRequestDto
{
    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public string? Description { get; set; }
}

public sealed class UpdateSubjectRequestDto
{
    public string SubjectName { get; set; } = string.Empty;

    public string? SubjectCode { get; set; }

    public string? Description { get; set; }
}