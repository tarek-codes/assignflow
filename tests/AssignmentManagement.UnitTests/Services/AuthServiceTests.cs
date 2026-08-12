using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.DTOs.Authentication;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtServiceMock = new Mock<IJwtService>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        _authService = new AuthService(
            _userRepoMock.Object,
            _passwordHasherMock.Object,
            _jwtServiceMock.Object,
            _currentUserServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnAuthResponseDto_WhenCredentialsAreValid()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "teacher@example.com", Password = "Password123!" };
        var user = new User
        {
            Id = 1,
            Email = "teacher@example.com",
            FirstName = "John",
            LastName = "Doe",
            Role = UserRole.Teacher,
            IsActive = true,
            PasswordHash = "hashed_password"
        };

        var tokenResult = new JwtTokenResultDto
        {
            AccessToken = "jwt_access_token",
            RefreshToken = "jwt_refresh_token",
            AccessTokenExpiresAtUtc = DateTime.UtcNow.AddHours(2),
            RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(h => h.Verify(request.Password, user.PasswordHash))
            .Returns(true);

        _jwtServiceMock.Setup(j => j.GenerateTokensAsync(user, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokenResult);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal("John Doe", result.FullName);
        Assert.Equal("jwt_access_token", result.AccessToken);
        Assert.Equal("Teacher", result.Role);
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowUnauthorizedAccessException_WhenUserNotFound()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "unknown@example.com", Password = "Password123!" };

        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowUnauthorizedAccessException_WhenPasswordIsInvalid()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "teacher@example.com", Password = "WrongPassword" };
        var user = new User { Id = 1, Email = request.Email, IsActive = true, PasswordHash = "hashed" };

        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(h => h.Verify(request.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowUnauthorizedAccessException_WhenUserIsInactive()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "inactive@example.com", Password = "Password123!" };
        var user = new User { Id = 1, Email = request.Email, IsActive = false, PasswordHash = "hashed" };

        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task RefreshTokenAsync_ShouldReturnNewTokens_WhenRequestIsValid()
    {
        // Arrange
        var request = new RefreshTokenRequestDto { Email = "student@example.com", RefreshToken = "valid_refresh_token" };
        var user = new User { Id = 5, Email = request.Email, IsActive = true };
        var tokenResult = new JwtTokenResultDto
        {
            AccessToken = "new_access_token",
            RefreshToken = "new_refresh_token",
            AccessTokenExpiresAtUtc = DateTime.UtcNow.AddHours(2),
            RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _jwtServiceMock.Setup(j => j.GenerateTokensAsync(user, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokenResult);

        // Act
        var result = await _authService.RefreshTokenAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("new_access_token", result.AccessToken);
        Assert.Equal("new_refresh_token", result.RefreshToken);
    }

    [Fact]
    public async Task LogoutAsync_ShouldLogAndCompleteSuccessfully()
    {
        // Arrange
        _currentUserServiceMock.Setup(u => u.UserId).Returns(10);
        _currentUserServiceMock.Setup(u => u.Email).Returns("student@example.com");

        // Act
        await _authService.LogoutAsync();

        // Assert
        _currentUserServiceMock.Verify(u => u.UserId, Times.Once);
    }
}
