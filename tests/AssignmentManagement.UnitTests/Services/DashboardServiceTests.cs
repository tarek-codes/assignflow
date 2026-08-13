using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Dashboard;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.UnitTests.TestHelpers;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IDashboardRepository> _repoMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly DashboardService _dashboardService;

    public DashboardServiceTests()
    {
        _repoMock = new Mock<IDashboardRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _dashboardService = new DashboardService(_repoMock.Object, _currentUserServiceMock.Object, new PassThroughCacheService());
    }

    [Fact]
    public async Task GetAdminDashboardAsync_ShouldReturnData_WhenUserIsAdmin()
    {
        // Arrange
        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Admin);

        var expectedDto = new AdminDashboardDto
        {
            TotalUsers = 50,
            TotalTeachers = 10,
            TotalStudents = 35,
            TotalAssignments = 20,
            TotalSubmissions = 45
        };

        _repoMock.Setup(r => r.GetAdminDashboardMetricsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _dashboardService.GetAdminDashboardAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(50, result.TotalUsers);
        Assert.Equal(10, result.TotalTeachers);
        Assert.Equal(35, result.TotalStudents);
    }

    [Fact]
    public async Task GetTeacherDashboardAsync_ShouldThrowForbidden_WhenUserIsNotTeacher()
    {
        // Arrange
        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(() => _dashboardService.GetTeacherDashboardAsync());
    }

    [Fact]
    public async Task GetStudentDashboardAsync_ShouldReturnData_WhenUserIsStudent()
    {
        // Arrange
        const int studentUserId = 15;
        _currentUserServiceMock.Setup(u => u.IsAuthenticated).Returns(true);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(studentUserId);
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Student);

        var expectedDto = new StudentDashboardDto
        {
            TotalUpcomingAssignments = 3,
            TotalSubmitted = 5,
            TotalPending = 2,
            TotalGraded = 4
        };

        _repoMock.Setup(r => r.GetStudentDashboardMetricsAsync(studentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _dashboardService.GetStudentDashboardAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalUpcomingAssignments);
        Assert.Equal(5, result.TotalSubmitted);
    }
}
