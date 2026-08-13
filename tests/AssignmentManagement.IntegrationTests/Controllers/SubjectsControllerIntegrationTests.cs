using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class SubjectsControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SubjectsControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: SubjectsController - Get Subjects Endpoint Response
    [Fact]
    public async Task GetSubjects_ShouldReturnStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/subjects");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }

    // Test Name: SubjectsController - Get Non Existent Subject Returns NotFound Or Unauthorized
    [Fact]
    public async Task GetSubjectById_ShouldReturnNotFoundOrUnauthorized_WhenIdDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/subjects/999999");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }
}
