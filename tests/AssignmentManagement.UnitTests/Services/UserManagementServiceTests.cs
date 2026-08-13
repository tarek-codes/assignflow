using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class UserManagementServiceTests
{
    private readonly Mock<IUserManagementRepository> _repositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly UserManagementService _userService;

    public UserManagementServiceTests()
    {
        _repositoryMock = new Mock<IUserManagementRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _userService = new UserManagementService(_repositoryMock.Object, _passwordHasherMock.Object);
    }

    // Test Name: UserManagementService - GetUsersAsync Returns Paged Users List
    [Fact]
    public async Task GetUsersAsync_ShouldReturnPagedUsers_WhenQueried()
    {
        // Arrange
        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var sampleUsers = new List<User>
        {
            new User { Id = 1, FirstName = "Admin", LastName = "User", Email = "admin@assignflow.com", Role = UserRole.Admin, IsActive = true },
            new User { Id = 2, FirstName = "John", LastName = "Teacher", Email = "john@assignflow.com", Role = UserRole.Teacher, IsActive = true }
        };

        var pagedResult = new PagedResult<User>(sampleUsers, 1, 10, 2);
        _repositoryMock.Setup(r => r.GetUsersAsync(query, It.IsAny<CancellationToken>())).ReturnsAsync(pagedResult);

        // Act
        var result = await _userService.GetUsersAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal("Admin", result.Items[0].FirstName);
        Assert.Equal("John", result.Items[1].FirstName);
    }

    // Test Name: UserManagementService - GetUserAsync Returns User Detail Dto
    [Fact]
    public async Task GetUserAsync_ShouldReturnUserDetail_WhenUserExists()
    {
        // Arrange
        const int userId = 10;
        var existingUser = new User
        {
            Id = userId,
            FirstName = "Sarah",
            LastName = "Connor",
            Email = "sarah@assignflow.com",
            Role = UserRole.Student,
            IsActive = true
        };

        _repositoryMock.Setup(r => r.GetUserAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(existingUser);

        // Act
        var result = await _userService.GetUserAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sarah", result.FirstName);
        Assert.Equal("sarah@assignflow.com", result.Email);
    }

    // Test Name: UserManagementService - CreateUserAsync Hashes Password And Creates Active Account
    [Fact]
    public async Task CreateUserAsync_ShouldHashPasswordAndSaveUser_WhenValidRequest()
    {
        // Arrange
        var request = new CreateUserRequestDto
        {
            FirstName = "Michael",
            LastName = "Scott",
            Email = "michael@dundermifflin.com",
            Password = "SecurePassword123!",
            Role = UserRole.Teacher
        };

        _repositoryMock.Setup(r => r.EmailExistsAsync("michael@dundermifflin.com", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _passwordHasherMock.Setup(p => p.Hash("SecurePassword123!")).Returns("Hashed_SecurePassword123!");

        // Act
        var result = await _userService.CreateUserAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Michael", result.FirstName);
        Assert.Equal("michael@dundermifflin.com", result.Email);
        _passwordHasherMock.Verify(p => p.Hash("SecurePassword123!"), Times.Once);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: UserManagementService - CreateUserAsync Throws Conflict Exception On Duplicate Email
    [Fact]
    public async Task CreateUserAsync_ShouldThrowConflictException_WhenEmailAlreadyExists()
    {
        // Arrange
        var request = new CreateUserRequestDto
        {
            Email = "existing@assignflow.com",
            Password = "Password123!"
        };

        _repositoryMock.Setup(r => r.EmailExistsAsync("existing@assignflow.com", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => _userService.CreateUserAsync(request));
        Assert.Equal("Email already exists.", exception.Message);
    }

    // Test Name: UserManagementService - DeleteUserAsync Deactivates User Account
    [Fact]
    public async Task DeleteUserAsync_ShouldDeactivateUserAccount_WhenUserExists()
    {
        // Arrange
        const int userId = 5;
        var existingUser = new User { Id = userId, IsActive = true };

        _repositoryMock.Setup(r => r.GetUserAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(existingUser);

        // Act
        var result = await _userService.DeleteUserAsync(userId);

        // Assert
        Assert.True(result);
        Assert.False(existingUser.IsActive);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: UserManagementService - UpdateUserAsync Updates User Profile Information
    [Fact]
    public async Task UpdateUserAsync_ShouldUpdateProfile_WhenRequestIsValid()
    {
        // Arrange
        const int userId = 10;
        var existingUser = new User { Id = userId, FirstName = "Old", LastName = "Name", Email = "old@example.com", IsActive = true };
        var request = new UpdateUserRequestDto { FirstName = "New", LastName = "Name", Email = "new@example.com", Phone = "+123456" };

        _repositoryMock.Setup(r => r.GetUserAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(existingUser);
        _repositoryMock.Setup(r => r.EmailExistsAsync("new@example.com", userId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _userService.UpdateUserAsync(userId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New", result.FirstName);
        Assert.Equal("new@example.com", result.Email);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: UserManagementService - UpdateUserAsync Throws Conflict Exception On Email In Use
    [Fact]
    public async Task UpdateUserAsync_ShouldThrowConflictException_WhenEmailInUseByAnotherUser()
    {
        // Arrange
        const int userId = 10;
        var existingUser = new User { Id = userId, Email = "old@example.com" };
        var request = new UpdateUserRequestDto { Email = "inuse@example.com" };

        _repositoryMock.Setup(r => r.GetUserAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(existingUser);
        _repositoryMock.Setup(r => r.EmailExistsAsync("inuse@example.com", userId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => _userService.UpdateUserAsync(userId, request));
        Assert.Equal("Email already exists.", exception.Message);
    }

    // Test Name: UserManagementService - GetTeachersAsync Returns Paged Teachers Directory
    [Fact]
    public async Task GetTeachersAsync_ShouldReturnPagedTeachers_WhenQueried()
    {
        // Arrange
        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var sampleTeachers = new List<Teacher>
        {
            new Teacher { Id = 1, Designation = "Senior Lecturer", User = new User { FirstName = "Anisur", LastName = "Rahman", Email = "anisur@example.com" } }
        };

        var pagedResult = new PagedResult<Teacher>(sampleTeachers, 1, 10, 1);
        _repositoryMock.Setup(r => r.GetTeachersAsync(query, It.IsAny<CancellationToken>())).ReturnsAsync(pagedResult);

        // Act
        var result = await _userService.GetTeachersAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal("Anisur", result.Items[0].FirstName);
    }

    // Test Name: UserManagementService - GetStudentsAsync Returns Paged Students Directory
    [Fact]
    public async Task GetStudentsAsync_ShouldReturnPagedStudents_WhenQueried()
    {
        // Arrange
        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var sampleStudents = new List<Student>
        {
            new Student { Id = 1, StudentNumber = "BD-2026-001", ClassLevel = 10, User = new User { FirstName = "Abrar", LastName = "Rahman", Email = "abrar@example.com" } }
        };

        var pagedResult = new PagedResult<Student>(sampleStudents, 1, 10, 1);
        _repositoryMock.Setup(r => r.GetStudentsAsync(query, It.IsAny<CancellationToken>())).ReturnsAsync(pagedResult);

        // Act
        var result = await _userService.GetStudentsAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal("Abrar", result.Items[0].FirstName);
        Assert.Equal(10, result.Items[0].ClassLevel);
    }
}

