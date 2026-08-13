using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Common;
using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Application.Services;
using AssignmentManagement.Domain.Entities;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class SubjectServiceTests
{
    private readonly Mock<ISubjectRepository> _repositoryMock;
    private readonly SubjectService _subjectService;

    public SubjectServiceTests()
    {
        _repositoryMock = new Mock<ISubjectRepository>();
        _subjectService = new SubjectService(_repositoryMock.Object);
    }

    // Test Name: SubjectService - GetSubjectsAsync Returns Mapped Paged Result
    [Fact]
    public async Task GetSubjectsAsync_ShouldReturnMappedSubjects_WhenQueried()
    {
        // Arrange
        var query = new PaginationQueryDto { PageNumber = 1, PageSize = 10 };
        var sampleSubjects = new List<Subject>
        {
            new Subject { Id = 1, SubjectName = "Mathematics", SubjectCode = "MATH101", Description = "Algebra & Geometry" },
            new Subject { Id = 2, SubjectName = "English Literature", SubjectCode = "ENG101", Description = "Literature & Writing" }
        };

        var pagedResult = new PagedResult<Subject>(sampleSubjects, 1, 10, 2);
        _repositoryMock.Setup(r => r.GetSubjectsAsync(query, It.IsAny<CancellationToken>())).ReturnsAsync(pagedResult);

        // Act
        var result = await _subjectService.GetSubjectsAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal("Mathematics", result.Items[0].SubjectName);
        Assert.Equal("MATH101", result.Items[0].SubjectCode);
    }

    // Test Name: SubjectService - GetSubjectAsync Returns Subject Detail Dto When Found
    [Fact]
    public async Task GetSubjectAsync_ShouldReturnSubjectDetail_WhenSubjectExists()
    {
        // Arrange
        const int subjectId = 1;
        var existingSubject = new Subject
        {
            Id = subjectId,
            SubjectName = "Biology",
            SubjectCode = "BIO201",
            Description = "Cell Biology & Genetics"
        };

        _repositoryMock.Setup(r => r.GetSubjectAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(existingSubject);

        // Act
        var result = await _subjectService.GetSubjectAsync(subjectId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Biology", result.SubjectName);
        Assert.Equal("BIO201", result.SubjectCode);
    }

    // Test Name: SubjectService - CreateSubjectAsync Successfully Creates Subject
    [Fact]
    public async Task CreateSubjectAsync_ShouldCreateSubject_WhenUnique()
    {
        // Arrange
        var request = new CreateSubjectRequestDto
        {
            SubjectName = "Higher Math",
            SubjectCode = "HMATH301",
            Description = "Calculus and Trigonometry"
        };

        _repositoryMock.Setup(r => r.NameExistsAsync("Higher Math", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.CodeExistsAsync("HMATH301", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _subjectService.CreateSubjectAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Higher Math", result.SubjectName);
        Assert.Equal("HMATH301", result.SubjectCode);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Subject>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: SubjectService - CreateSubjectAsync Throws Conflict Exception When Subject Name Exists
    [Fact]
    public async Task CreateSubjectAsync_ShouldThrowConflictException_WhenNameExists()
    {
        // Arrange
        var request = new CreateSubjectRequestDto
        {
            SubjectName = "Physics",
            SubjectCode = "PHY101"
        };

        _repositoryMock.Setup(r => r.NameExistsAsync("Physics", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => _subjectService.CreateSubjectAsync(request));
        Assert.Equal("Subject name already exists.", exception.Message);
    }

    // Test Name: SubjectService - DeleteSubjectAsync Throws Conflict Exception When Subject Has Assigned Classes
    [Fact]
    public async Task DeleteSubjectAsync_ShouldThrowConflictException_WhenSubjectHasClasses()
    {
        // Arrange
        const int subjectId = 10;
        var existingSubject = new Subject { Id = subjectId, SubjectName = "Chemistry" };

        _repositoryMock.Setup(r => r.GetSubjectAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(existingSubject);
        _repositoryMock.Setup(r => r.HasClassesAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => _subjectService.DeleteSubjectAsync(subjectId));
        Assert.Equal("Subject cannot be deleted because it is assigned to one or more classes.", exception.Message);
    }

    // Test Name: SubjectService - UpdateSubjectAsync Modifies Subject Name And Code
    [Fact]
    public async Task UpdateSubjectAsync_ShouldUpdateSubject_WhenValidRequest()
    {
        // Arrange
        const int subjectId = 1;
        var existingSubject = new Subject { Id = subjectId, SubjectName = "Old Name", SubjectCode = "OLD101" };
        var request = new UpdateSubjectRequestDto { SubjectName = "New Name", SubjectCode = "NEW101", Description = "Updated" };

        _repositoryMock.Setup(r => r.GetSubjectAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(existingSubject);
        _repositoryMock.Setup(r => r.NameExistsAsync("New Name", subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.CodeExistsAsync("NEW101", subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _subjectService.UpdateSubjectAsync(subjectId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Name", result.SubjectName);
        Assert.Equal("NEW101", result.SubjectCode);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    // Test Name: SubjectService - DeleteSubjectAsync Returns True When Subject Unassigned
    [Fact]
    public async Task DeleteSubjectAsync_ShouldReturnTrue_WhenSubjectHasNoClasses()
    {
        // Arrange
        const int subjectId = 10;
        var existingSubject = new Subject { Id = subjectId, SubjectName = "Unassigned Subject" };

        _repositoryMock.Setup(r => r.GetSubjectAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(existingSubject);
        _repositoryMock.Setup(r => r.HasClassesAsync(subjectId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        // Act
        var result = await _subjectService.DeleteSubjectAsync(subjectId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(r => r.Remove(existingSubject), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}

