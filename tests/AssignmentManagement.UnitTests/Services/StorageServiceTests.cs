using AssignmentManagement.Infrastructure.Services;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace AssignmentManagement.UnitTests.Services;

public class StorageServiceTests
{
    private readonly StorageOptions _storageOptions;
    private readonly StorageService _storageService;

    public StorageServiceTests()
    {
        _storageOptions = new StorageOptions
        {
            SubmissionRootPath = "./test_storage/submissions",
            MaxUploadSizeMb = 10
        };

        var optionsMock = new Mock<IOptions<StorageOptions>>();
        optionsMock.Setup(o => o.Value).Returns(_storageOptions);

        _storageService = new StorageService(optionsMock.Object);
    }

    [Fact]
    public void ValidateFile_ShouldRejectNullOrEmptyFile()
    {
        IFormFile? file = null;
        Assert.Throws<ValidationException>(() => _storageService.ValidateFile(file!));
    }

    [Fact]
    public void ValidateFile_ShouldRejectInvalidExtension()
    {
        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.FileName).Returns("script.exe");
        fileMock.Setup(f => f.Length).Returns(1024);

        Assert.Throws<ValidationException>(() => _storageService.ValidateFile(fileMock.Object));
    }

    [Fact]
    public void ValidateFile_ShouldAcceptValidPdfFile()
    {
        var pdfBytes = "%PDF-1.5 sample content"u8.ToArray();
        using var memoryStream = new MemoryStream(pdfBytes);

        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.FileName).Returns("assignment.pdf");
        fileMock.Setup(f => f.Length).Returns(pdfBytes.Length);
        fileMock.Setup(f => f.OpenReadStream()).Returns(memoryStream);

        // Should not throw exception
        _storageService.ValidateFile(fileMock.Object);
    }

    [Fact]
    public void ValidateFile_ShouldAcceptValidDocxFile()
    {
        // PK\x03\x04 signature for zip/docx
        byte[] docxBytes = [0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00];
        using var memoryStream = new MemoryStream(docxBytes);

        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.FileName).Returns("assignment.docx");
        fileMock.Setup(f => f.Length).Returns(docxBytes.Length);
        fileMock.Setup(f => f.OpenReadStream()).Returns(memoryStream);

        // Should not throw exception
        _storageService.ValidateFile(fileMock.Object);
    }
}
