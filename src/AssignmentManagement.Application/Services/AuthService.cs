using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.DTOs.Authentication;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ICurrentUserService currentUserService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = request.Email?.Trim() ?? string.Empty;
        var pwd = request.Password?.Trim() ?? string.Empty;

        _logger.LogInformation("Login attempt received for email '{Email}' (length {Len})", email, pwd.Length);

        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("Login failed: No user found for email '{Email}'", email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: User {UserId} ({Email}) is inactive", user.Id, email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var isPasswordValid = _passwordHasher.Verify(pwd, user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login failed: Password mismatch for user {UserId} ({Email}). Input Pwd Len: {Len}, Hash: {Hash}", user.Id, email, pwd.Length, user.PasswordHash.Substring(0, Math.Min(15, user.PasswordHash.Length)));
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var tokens = await _jwtService.GenerateTokensAsync(user, cancellationToken);

        _logger.LogInformation("User {UserId} ({Email}) logged in successfully with role {Role}", user.Id, user.Email, user.Role);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            Email = user.Email,
            Role = user.Role.ToString(),
            Gender = user.Gender ?? "Male",
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            AccessTokenExpiresAtUtc = tokens.AccessTokenExpiresAtUtc,
            RefreshTokenExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken) || string.IsNullOrWhiteSpace(request.Email))
        {
            throw new UnauthorizedAccessException("Invalid refresh token request.");
        }

        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid user account.");
        }

        var tokens = await _jwtService.GenerateTokensAsync(user, cancellationToken);

        _logger.LogInformation("Tokens refreshed successfully for user {UserId} ({Email})", user.Id, user.Email);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(part => !string.IsNullOrWhiteSpace(part))),
            Email = user.Email,
            Role = user.Role.ToString(),
            Gender = user.Gender ?? "Male",
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            AccessTokenExpiresAtUtc = tokens.AccessTokenExpiresAtUtc,
            RefreshTokenExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc
        };
    }

    public Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;

        var userId = _currentUserService.UserId;
        var email = _currentUserService.Email;

        _logger.LogInformation("User {UserId} ({Email}) logged out", userId, email);

        return Task.CompletedTask;
    }

    public async Task ChangePasswordAsync(ChangePasswordRequestDto request, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var user = await _userRepository.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var currentPwd = request.CurrentPassword?.Trim() ?? string.Empty;
        var newPwd = request.NewPassword?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(currentPwd) || string.IsNullOrWhiteSpace(newPwd))
        {
            throw new InvalidOperationException("Both current and new password fields are required.");
        }

        if (!_passwordHasher.Verify(currentPwd, user.PasswordHash))
        {
            _logger.LogWarning("ChangePassword failed: Current password verification failed for user {UserId}", user.Id);
            throw new UnauthorizedAccessException("Current password is incorrect.");
        }

        var newHash = _passwordHasher.Hash(newPwd);
        user.PasswordHash = newHash;
        user.UpdatedAtUtc = DateTime.UtcNow;

        _userRepository.Update(user);
        var rowsAffected = await _userRepository.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Password changed successfully for user {UserId} ({Email}). Rows affected: {Rows}. New hash prefix: {Hash}", user.Id, user.Email, rowsAffected, newHash.Substring(0, Math.Min(15, newHash.Length)));
    }

    public async Task<bool> CheckEmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalized, cancellationToken);
        return user != null;
    }
}