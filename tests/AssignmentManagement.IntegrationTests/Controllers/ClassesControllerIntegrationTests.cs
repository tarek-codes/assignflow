using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class ClassesControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ClassesControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: ClassesController - Get Classes Directory Endpoint Response
    [Fact]
    public async Task GetClasses_ShouldReturnStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/classes");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }

    // Test Name: ClassesController - Get Non Existent Class Returns NotFound Or Unauthorized
    [Fact]
    public async Task GetClassById_ShouldReturnNotFoundOrUnauthorized_WhenIdDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/classes/999999");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }
}
