namespace AssignmentManagement.Application.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string Secret { get; set; } = string.Empty;

    public int ExpiryMinutes { get; set; }

    public int RefreshTokenExpiryDays { get; set; } = 7;
}