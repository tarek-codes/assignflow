using AssignmentManagement.Domain.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AssignmentManagement.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int? GetUserId(this ClaimsPrincipal? principal)
    {
        var value = principal?.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return int.TryParse(value, out var userId) ? userId : null;
    }

    public static string? GetEmail(this ClaimsPrincipal? principal)
    {
        return principal?.FindFirstValue(ClaimTypes.Email) ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Email);
    }

    public static string? GetFullName(this ClaimsPrincipal? principal)
    {
        return principal?.FindFirstValue(ClaimTypes.Name);
    }

    public static UserRole? GetRoleValue(this ClaimsPrincipal? principal)
    {
        var role = principal?.FindFirstValue(ClaimTypes.Role);

        return Enum.TryParse<UserRole>(role, ignoreCase: true, out var parsedRole) ? parsedRole : null;
    }
}