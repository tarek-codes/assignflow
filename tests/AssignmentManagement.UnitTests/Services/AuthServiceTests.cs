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

    // Test Name: AuthService - ChangePasswordAsync Updates Password When Current Password Matches
    [Fact]
    public async Task ChangePasswordAsync_ShouldUpdatePassword_WhenCurrentPasswordIsValid()
    {
        // Arrange
        const int userId = 5;
        var request = new ChangePasswordRequestDto { CurrentPassword = "OldPassword123!", NewPassword = "NewPassword123!" };
        var user = new User { Id = userId, Email = "student@example.com", PasswordHash = "old_hashed_password", IsActive = true };

        _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.Verify("OldPassword123!", "old_hashed_password")).Returns(true);
        _passwordHasherMock.Setup(h => h.Hash("NewPassword123!")).Returns("new_hashed_password");

        // Act
        await _authService.ChangePasswordAsync(request);

        // Assert
        Assert.Equal("new_hashed_password", user.PasswordHash);
        _userRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: AuthService - ChangePasswordAsync Throws Unauthorized When Current Password Invalid
    [Fact]
    public async Task ChangePasswordAsync_ShouldThrowUnauthorized_WhenCurrentPasswordIsInvalid()
    {
        // Arrange
        const int userId = 5;
        var request = new ChangePasswordRequestDto { CurrentPassword = "WrongOldPassword", NewPassword = "NewPassword123!" };
        var user = new User { Id = userId, Email = "student@example.com", PasswordHash = "old_hashed_password", IsActive = true };

        _currentUserServiceMock.Setup(u => u.UserId).Returns(userId);
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.Verify("WrongOldPassword", "old_hashed_password")).Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.ChangePasswordAsync(request));
    }

    // Test Name: AuthService - CheckEmailExistsAsync Returns True When Email Present In System
    [Fact]
    public async Task CheckEmailExistsAsync_ShouldReturnTrue_WhenEmailExists()
    {
        // Arrange
        const string email = "existing@example.com";
        var existingUser = new User { Id = 1, Email = email };
        _userRepoMock.Setup(r => r.GetByEmailAsync(email, It.IsAny<CancellationToken>())).ReturnsAsync(existingUser);

        // Act
        var result = await _authService.CheckEmailExistsAsync(email);

        // Assert
        Assert.True(result);
    }

    // Test Name: AuthService - CheckEmailExistsAsync Returns False When Email Available
    [Fact]
    public async Task CheckEmailExistsAsync_ShouldReturnFalse_WhenEmailAvailable()
    {
        // Arrange
        const string email = "new.email@example.com";
        _userRepoMock.Setup(r => r.GetByEmailAsync(email, It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        // Act
        var result = await _authService.CheckEmailExistsAsync(email);

        // Assert
        Assert.False(result);
    }
}


