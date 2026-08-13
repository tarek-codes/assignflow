using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.UnitTests.TestHelpers;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class ClassServiceTests
{
    private readonly Mock<IClassRepository> _repositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly ClassService _classService;

    public ClassServiceTests()
    {
        _repositoryMock = new Mock<IClassRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _classService = new ClassService(_repositoryMock.Object, _currentUserServiceMock.Object, new PassThroughCacheService());
    }

    // Test Name: ClassService - GetClassesAsync Returns Paged List For Admin User
    [Fact]
    public async Task GetClassesAsync_ShouldReturnPagedResult_ForAdminUser()
    {
        // Arrange
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Admin);

        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var sampleClasses = new List<Class>
        {
            new Class
            {
                Id = 1,
                ClassLevel = 10,
                Subject = new Subject { Id = 101, SubjectName = "Physics" },
                Teacher = new Teacher { Id = 5, User = new User { FirstName = "John", LastName = "Doe" } }
            }
        };

        var pagedResult = new PagedResult<Class>(sampleClasses, 1, 10, 1);

        _repositoryMock
            .Setup(r => r.GetClassesAsync(query, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _classService.GetClassesAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal(1, result.Items[0].Id);
        Assert.Equal(10, result.Items[0].ClassLevel);
        Assert.Equal("Physics", result.Items[0].SubjectName);
    }

    // Test Name: ClassService - GetClassesAsync Filter By Teacher User ID When Role Is Teacher
    [Fact]
    public async Task GetClassesAsync_ShouldFilterByTeacherUserId_WhenUserIsTeacher()
    {
        // Arrange
        const int teacherUserId = 42;
        _currentUserServiceMock.Setup(u => u.Role).Returns(UserRole.Teacher);
        _currentUserServiceMock.Setup(u => u.UserId).Returns(teacherUserId);

        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var pagedResult = new PagedResult<Class>(new List<Class>(), 1, 10, 0);

        _repositoryMock
            .Setup(r => r.GetClassesAsync(query, teacherUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _classService.GetClassesAsync(query);

        // Assert
        Assert.NotNull(result);
        _repositoryMock.Verify(r => r.GetClassesAsync(query, teacherUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: ClassService - GetClassAsync Returns Mapped Detail Dto When Class Exists
    [Fact]
    public async Task GetClassAsync_ShouldReturnClassDetailDto_WhenClassExists()
    {
        // Arrange
        const int classId = 1;
        var existingClass = new Class
        {
            Id = classId,
            ClassLevel = 9,
            Description = "Class 9 General Science",
            Subject = new Subject { Id = 20, SubjectName = "General Science" },
            Teacher = new Teacher { Id = 3, User = new User { FirstName = "Jane", LastName = "Smith" } }
        };

        _repositoryMock
            .Setup(r => r.GetClassAsync(classId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingClass);

        // Act
        var result = await _classService.GetClassAsync(classId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(classId, result.Id);
        Assert.Equal(9, result.ClassLevel);
        Assert.Equal("General Science", result.SubjectName);
    }

    // Test Name: ClassService - GetClassAsync Returns Null When Class Does Not Exist
    [Fact]
    public async Task GetClassAsync_ShouldReturnNull_WhenClassDoesNotExist()
    {
        // Arrange
        _repositoryMock
            .Setup(r => r.GetClassAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Class?)null);

        // Act
        var result = await _classService.GetClassAsync(999);

        // Assert
        Assert.Null(result);
    }

    // Test Name: ClassService - CreateClassAsync Creates Classroom Successfully When Valid
    [Fact]
    public async Task CreateClassAsync_ShouldCreateClassroom_WhenValidationPasses()
    {
        // Arrange
        var request = new CreateClassRequestDto
        {
            ClassLevel = 11,
            SubjectId = 5,
            TeacherId = 2,
            Description = "Class 11 Science"
        };

        _repositoryMock.Setup(r => r.SubjectExistsAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.TeacherExistsAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.HasDuplicateCombinationAsync(11, 5, null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.AddAsync(It.IsAny<Class>(), It.IsAny<CancellationToken>()))
            .Callback<Class, CancellationToken>((c, _) => c.Id = 10)
            .Returns(Task.CompletedTask);

        var createdClass = new Class
        {
            Id = 10,
            ClassLevel = 11,
            SubjectId = 5,
            TeacherId = 2,
            Description = "Class 11 Science",
            Subject = new Subject { Id = 5, SubjectName = "Chemistry" },
            Teacher = new Teacher { Id = 2, User = new User { FirstName = "Alice", LastName = "Bob" } }
        };

        _repositoryMock.Setup(r => r.GetClassAsync(10, It.IsAny<CancellationToken>())).ReturnsAsync(createdClass);

        // Act
        var result = await _classService.CreateClassAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(11, result.ClassLevel);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Class>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: ClassService - CreateClassAsync Throws Conflict Exception On Duplicate Combination
    [Fact]
    public async Task CreateClassAsync_ShouldThrowConflictException_WhenDuplicateClassLevelAndSubject()
    {
        // Arrange
        var request = new CreateClassRequestDto
        {
            ClassLevel = 10,
            SubjectId = 1,
            TeacherId = 1
        };

        _repositoryMock.Setup(r => r.SubjectExistsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.TeacherExistsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.HasDuplicateCombinationAsync(10, 1, null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => _classService.CreateClassAsync(request));
        Assert.Equal("Class level and subject combination already exists.", exception.Message);
    }

    // Test Name: ClassService - DeleteClassAsync Deletes Existing Classroom
    [Fact]
    public async Task DeleteClassAsync_ShouldDeleteClass_WhenClassExists()
    {
        // Arrange
        const int classId = 5;
        var existingClass = new Class { Id = classId };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, It.IsAny<CancellationToken>())).ReturnsAsync(existingClass);

        // Act
        var result = await _classService.DeleteClassAsync(classId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(r => r.Remove(existingClass), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: ClassService - UpdateClassAsync Updates Classroom Properties When Valid
    [Fact]
    public async Task UpdateClassAsync_ShouldUpdateClassroom_WhenValidRequest()
    {
        // Arrange
        const int classId = 10;
        var existingClass = new Class { Id = classId, ClassLevel = 9, SubjectId = 1, TeacherId = 1 };
        var request = new UpdateClassRequestDto { ClassLevel = 10, SubjectId = 2, TeacherId = 3, Description = "Updated Class 10" };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, It.IsAny<CancellationToken>())).ReturnsAsync(existingClass);
        _repositoryMock.Setup(r => r.SubjectExistsAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.TeacherExistsAsync(3, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.HasDuplicateCombinationAsync(10, 2, classId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _classService.UpdateClassAsync(classId, request);

        // Assert
        Assert.NotNull(result);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: ClassService - AssignTeacherAsync Reassigns Teacher ID Successfully
    [Fact]
    public async Task AssignTeacherAsync_ShouldUpdateTeacherId_WhenTeacherExists()
    {
        // Arrange
        const int classId = 10;
        const int newTeacherId = 5;
        var existingClass = new Class { Id = classId, TeacherId = 1 };
        var request = new AssignTeacherRequestDto { TeacherId = newTeacherId };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, It.IsAny<CancellationToken>())).ReturnsAsync(existingClass);
        _repositoryMock.Setup(r => r.TeacherExistsAsync(newTeacherId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act
        var result = await _classService.AssignTeacherAsync(classId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(newTeacherId, existingClass.TeacherId);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: ClassService - AssignSubjectAsync Reassigns Subject ID Successfully
    [Fact]
    public async Task AssignSubjectAsync_ShouldUpdateSubjectId_WhenSubjectExists()
    {
        // Arrange
        const int classId = 10;
        const int newSubjectId = 4;
        var existingClass = new Class { Id = classId, ClassLevel = 10, SubjectId = 1 };
        var request = new AssignSubjectRequestDto { SubjectId = newSubjectId };

        _repositoryMock.Setup(r => r.GetClassAsync(classId, It.IsAny<CancellationToken>())).ReturnsAsync(existingClass);
        _repositoryMock.Setup(r => r.SubjectExistsAsync(newSubjectId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.HasDuplicateCombinationAsync(10, newSubjectId, classId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _classService.AssignSubjectAsync(classId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(newSubjectId, existingClass.SubjectId);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

