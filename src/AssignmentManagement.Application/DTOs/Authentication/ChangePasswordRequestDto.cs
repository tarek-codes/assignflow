namespace AssignmentManagement.Application.DTOs.Authentication;

public sealed class ChangePasswordRequestDto
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}
