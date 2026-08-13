using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.UnitTests.TestHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class SubmissionServiceTests
{
    private readonly Mock<ISubmissionRepository> _submissionRepoMock;
    private readonly Mock<IAssignmentRepository> _assignmentRepoMock;
    private readonly Mock<IStorageService> _storageServiceMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<ILogger<SubmissionService>> _loggerMock;
    private readonly SubmissionService _submissionService;

    public SubmissionServiceTests()
    {
        _submissionRepoMock = new Mock<ISubmissionRepository>();
        _assignmentRepoMock = new Mock<IAssignmentRepository>();
        _storageServiceMock = new Mock<IStorageService>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _loggerMock = new Mock<ILogger<SubmissionService>>();

        _submissionService = new SubmissionService(
            _submissionRepoMock.Object,
            _assignmentRepoMock.Object,
            _storageServiceMock.Object,
            _currentUserServiceMock.Object,
            new PassThroughCacheService(),
            _loggerMock.Object);
    }

    [Fact]
    public async Task SubmitOrReplaceAsync_ShouldThrowConflictException_WhenDeadlineHasPassed()
    {
        // Arrange
        const int studentUserId = 10;
        const int assignmentId = 1;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(studentUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        _submissionRepoMock.Setup(r => r.GetStudentByUserIdAsync(studentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Student { Id = 5, UserId = studentUserId });

        _assignmentRepoMock.Setup(r => r.GetAssignmentAsync(assignmentId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Assignment
            {
                Id = assignmentId,
                Status = AssignmentStatus.Published,
                DeadlineUtc = DateTime.UtcNow.AddHours(-1), // Past deadline
                AllowResubmission = true
            });

        var fileMock = new Mock<IFormFile>();
        var request = new SubmitAssignmentRequestDto { File = fileMock.Object };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _submissionService.SubmitOrReplaceAsync(assignmentId, request));

        Assert.Contains("deadline has passed", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubmitOrReplaceAsync_ShouldThrowConflictException_WhenResubmissionNotAllowed()
    {
        // Arrange
        const int studentUserId = 10;
        const int assignmentId = 1;
        const int studentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(studentUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        _submissionRepoMock.Setup(r => r.GetStudentByUserIdAsync(studentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Student { Id = studentId, UserId = studentUserId });

        _assignmentRepoMock.Setup(r => r.GetAssignmentAsync(assignmentId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Assignment
            {
                Id = assignmentId,
                Status = AssignmentStatus.Published,
                DeadlineUtc = DateTime.UtcNow.AddHours(24),
                AllowResubmission = false // Resubmission forbidden
            });

        _submissionRepoMock.Setup(r => r.IsStudentEnrolledInAssignmentClassAsync(studentId, assignmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _submissionRepoMock.Setup(r => r.GetByAssignmentAndStudentAsync(assignmentId, studentId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Submission { Id = 100, AssignmentId = assignmentId, StudentId = studentId });

        var fileMock = new Mock<IFormFile>();
        var request = new SubmitAssignmentRequestDto { File = fileMock.Object };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _submissionService.SubmitOrReplaceAsync(assignmentId, request));

        Assert.Contains("Resubmission is not allowed", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubmitOrReplaceAsync_ShouldThrowForbiddenException_WhenStudentNotEnrolledInClass()
    {
        // Arrange
        const int studentUserId = 10;
        const int assignmentId = 1;
        const int studentId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(studentUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        _submissionRepoMock.Setup(r => r.GetStudentByUserIdAsync(studentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Student { Id = studentId, UserId = studentUserId });

        _assignmentRepoMock.Setup(r => r.GetAssignmentAsync(assignmentId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Assignment
            {
                Id = assignmentId,
                Status = AssignmentStatus.Published,
                DeadlineUtc = DateTime.UtcNow.AddHours(24)
            });

        _submissionRepoMock.Setup(r => r.IsStudentEnrolledInAssignmentClassAsync(studentId, assignmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false); // Student not enrolled

        var fileMock = new Mock<IFormFile>();
        var request = new SubmitAssignmentRequestDto { File = fileMock.Object };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ForbiddenException>(() =>
            _submissionService.SubmitOrReplaceAsync(assignmentId, request));

        Assert.Contains("not enrolled in the class", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GradeSubmissionAsync_ShouldThrowConflictException_WhenMarksExceedMaxMarks()
    {
        // Arrange
        const int teacherUserId = 20;
        const int submissionId = 50;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Teacher);

        _submissionRepoMock.Setup(r => r.GetByIdAsync(submissionId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Submission
            {
                Id = submissionId,
                Assignment = new Assignment
                {
                    MaxMarks = 100,
                    Class = new Class
                    {
                        Teacher = new Teacher { UserId = teacherUserId }
                    }
                }
            });

        var request = new GradeSubmissionRequestDto
        {
            Marks = 150, // Exceeds MaxMarks 100
            Feedback = "Over maximum mark limit"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _submissionService.GradeSubmissionAsync(submissionId, request));

        Assert.Contains("maximum mark limit", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GradeSubmissionAsync_ShouldThrowForbiddenException_WhenTeacherNotAssignedToClass()
    {
        // Arrange
        const int teacherUserId = 20;
        const int submissionId = 50;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Teacher);

        _submissionRepoMock.Setup(r => r.GetByIdAsync(submissionId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Submission
            {
                Id = submissionId,
                Assignment = new Assignment
                {
                    MaxMarks = 100,
                    Class = new Class
                    {
                        Teacher = new Teacher { UserId = 99 } // Assigned to another teacher
                    }
                }
            });

        var request = new GradeSubmissionRequestDto { Marks = 80 };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ForbiddenException>(() =>
            _submissionService.GradeSubmissionAsync(submissionId, request));

        Assert.Contains("only grade submissions for your assigned classes", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetSubmissionFileStreamAsync_ShouldReturnFileStream_WhenUserAuthorized()
    {
        // Arrange
        const int studentUserId = 10;
        const int submissionId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(studentUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        var submission = new Submission
        {
            Id = submissionId,
            FileUrl = "1/sub_1_5_abc.pdf",
            Student = new Student { UserId = studentUserId }
        };

        _submissionRepoMock.Setup(r => r.GetByIdAsync(submissionId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(submission);

        using var memoryStream = new MemoryStream();
        _storageServiceMock.Setup(s => s.GetFileAsync("1/sub_1_5_abc.pdf", false, It.IsAny<CancellationToken>()))
            .ReturnsAsync((memoryStream, "application/pdf", "assignment.pdf"));

        // Act
        var result = await _submissionService.GetSubmissionFileStreamAsync(submissionId, isPreview: true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("application/pdf", result.ContentType);
        Assert.Equal("assignment.pdf", result.FileName);
        Assert.True(result.IsInline);
    }

    // Test Name: SubmissionService - GradeSubmissionAsync Evaluates Score And Calculates Grade Tier
    [Fact]
    public async Task GradeSubmissionAsync_ShouldGradeSubmission_WhenScoreIsValid()
    {
        // Arrange
        const int teacherUserId = 10;
        const int submissionId = 5;

        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var submission = new Submission
        {
            Id = submissionId,
            Assignment = new Assignment
            {
                MaxMarks = 50,
                Class = new Class { Teacher = new Teacher { UserId = teacherUserId } }
            }
        };

        _submissionRepoMock.Setup(r => r.GetByIdAsync(submissionId, true, It.IsAny<CancellationToken>())).ReturnsAsync(submission);

        var request = new GradeSubmissionRequestDto { Marks = 45, Feedback = "Excellent work!" };

        // Act
        var result = await _submissionService.GradeSubmissionAsync(submissionId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(45, submission.Marks);
        Assert.Equal("Excellent work!", submission.Feedback);
        Assert.Equal(SubmissionStatus.Graded, submission.Status);
        _submissionRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

