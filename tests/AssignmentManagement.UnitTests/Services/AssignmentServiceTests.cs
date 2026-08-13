using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.UnitTests.TestHelpers;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class AssignmentServiceTests
{
    private readonly Mock<IAssignmentRepository> _repositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<ILogger<AssignmentService>> _loggerMock;
    private readonly AssignmentService _assignmentService;

    public AssignmentServiceTests()
    {
        _repositoryMock = new Mock<IAssignmentRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _loggerMock = new Mock<ILogger<AssignmentService>>();

        _assignmentService = new AssignmentService(
            _repositoryMock.Object,
            _currentUserServiceMock.Object,
            new PassThroughCacheService(),
            _loggerMock.Object);
    }

    [Fact]
    public async Task CreateAssignmentAsync_ShouldCreateAssignment_WhenClassOwnedByTeacher()
    {
        // Arrange
        const int teacherUserId = 10;
        const int classId = 1;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var classEntity = new Class
        {
            Id = classId,
            Teacher = new Teacher { UserId = teacherUserId }
        };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(classEntity);

        var request = new CreateAssignmentRequestDto
        {
            ClassId = classId,
            Title = "Midterm Assignment",
            Description = "Chapter 1-5",
            DeadlineUtc = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            AllowResubmission = true
        };

        // Act
        var result = await _assignmentService.CreateAssignmentAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Midterm Assignment", result.Title);
        Assert.Equal(100, result.MaxMarks);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Assignment>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAssignmentAsync_ShouldThrowForbiddenException_WhenClassNotOwnedByTeacher()
    {
        // Arrange
        const int teacherUserId = 10;
        const int classId = 1;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Teacher);

        var classEntity = new Class
        {
            Id = classId,
            Teacher = new Teacher { UserId = 99 } // Owned by another teacher
        };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(classEntity);

        var request = new CreateAssignmentRequestDto
        {
            ClassId = classId,
            Title = "Unauthorized Assignment",
            DeadlineUtc = DateTime.UtcNow.AddDays(1),
            MaxMarks = 50
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ForbiddenException>(() =>
            _assignmentService.CreateAssignmentAsync(request));

        Assert.Contains("only manage assignments for your assigned classes", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PublishAssignmentAsync_ShouldThrowConflictException_WhenDeadlineIsInPast()
    {
        // Arrange
        const int teacherUserId = 10;
        const int assignmentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var assignment = new Assignment
        {
            Id = assignmentId,
            DeadlineUtc = DateTime.UtcNow.AddMinutes(-30), // Past deadline
            MaxMarks = 100,
            Class = new Class { Teacher = new Teacher { UserId = teacherUserId } }
        };

        _repositoryMock.Setup(r => r.GetAssignmentAsync(assignmentId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignment);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _assignmentService.PublishAssignmentAsync(assignmentId));

        Assert.Contains("deadline must be in the future", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PublishAssignmentAsync_ShouldThrowConflictException_WhenMaxMarksZeroOrNegative()
    {
        // Arrange
        const int teacherUserId = 10;
        const int assignmentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var assignment = new Assignment
        {
            Id = assignmentId,
            DeadlineUtc = DateTime.UtcNow.AddDays(5),
            MaxMarks = 0, // Invalid max marks
            Class = new Class { Teacher = new Teacher { UserId = teacherUserId } }
        };

        _repositoryMock.Setup(r => r.GetAssignmentAsync(assignmentId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignment);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _assignmentService.PublishAssignmentAsync(assignmentId));

        Assert.Contains("greater than zero", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PublishAssignmentAsync_ShouldPublish_WhenValid()
    {
        // Arrange
        const int teacherUserId = 10;
        const int assignmentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var assignment = new Assignment
        {
            Id = assignmentId,
            Status = AssignmentStatus.Draft,
            DeadlineUtc = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100,
            Class = new Class { Teacher = new Teacher { UserId = teacherUserId } }
        };

        _repositoryMock.Setup(r => r.GetAssignmentAsync(assignmentId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(assignment);

        // Act
        var result = await _assignmentService.PublishAssignmentAsync(assignmentId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AssignmentStatus.Published, assignment.Status);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: AssignmentService - GetAssignmentAsync Returns Assignment Detail Dto When Found
    [Fact]
    public async Task GetAssignmentAsync_ShouldReturnAssignmentDetail_WhenFound()
    {
        // Arrange
        const int assignmentId = 1;
        var existingAssignment = new Assignment
        {
            Id = assignmentId,
            Title = "Physics Chapter 1 Quiz",
            Description = "Kinematics questions",
            MaxMarks = 50,
            Status = AssignmentStatus.Published,
            Class = new Class { Id = 2, ClassLevel = 10, Subject = new Subject { SubjectName = "Physics" } }
        };

        _repositoryMock.Setup(r => r.GetAssignmentAsync(assignmentId, false, It.IsAny<CancellationToken>())).ReturnsAsync(existingAssignment);

        // Act
        var result = await _assignmentService.GetAssignmentAsync(assignmentId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Physics Chapter 1 Quiz", result.Title);
        Assert.Equal(50, result.MaxMarks);
    }

    // Test Name: AssignmentService - DeleteAssignmentAsync Removes Assignment When Owned By Teacher
    [Fact]
    public async Task DeleteAssignmentAsync_ShouldDeleteAssignment_WhenTeacherOwnsClass()
    {
        // Arrange
        const int teacherUserId = 10;
        const int assignmentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var assignment = new Assignment
        {
            Id = assignmentId,
            Class = new Class { Teacher = new Teacher { UserId = teacherUserId } }
        };

        _repositoryMock.Setup(r => r.GetAssignmentAsync(assignmentId, true, It.IsAny<CancellationToken>())).ReturnsAsync(assignment);

        // Act
        var result = await _assignmentService.DeleteAssignmentAsync(assignmentId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(r => r.Remove(assignment), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

