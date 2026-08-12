using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Authentication;
using AssignmentManagement.Application.DTOs.Authentication;
using AssignmentManagement.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentManagement.Infrastructure.Services;

public sealed class JwtService : IJwtService
{
    private readonly JwtOptions _jwtOptions;

    public JwtService(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }

    public Task<JwtTokenResultDto> GenerateTokensAsync(User user, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;

        var now = DateTime.UtcNow;
        var accessTokenExpiresAtUtc = now.AddMinutes(_jwtOptions.ExpiryMinutes);
        var refreshTokenExpiresAtUtc = now.AddDays(_jwtOptions.RefreshTokenExpiryDays);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, string.Join(' ', new[] { user.FirstName, user.LastName }.Where(part => !string.IsNullOrWhiteSpace(part)))),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            notBefore: now,
            expires: accessTokenExpiresAtUtc,
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        return Task.FromResult(new JwtTokenResultDto
        {
            AccessToken = accessToken,
            RefreshToken = GenerateRefreshToken(),
            AccessTokenExpiresAtUtc = accessTokenExpiresAtUtc,
            RefreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc
        });
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }
}