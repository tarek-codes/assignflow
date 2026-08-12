namespace AssignmentManagement.Application.DTOs.Authentication;

public sealed class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
