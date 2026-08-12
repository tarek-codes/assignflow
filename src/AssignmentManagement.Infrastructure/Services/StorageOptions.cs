namespace AssignmentManagement.Infrastructure.Services;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string SubmissionRootPath { get; set; } = "./storage/submissions";

    public int MaxUploadSizeMb { get; set; } = 10;
}
