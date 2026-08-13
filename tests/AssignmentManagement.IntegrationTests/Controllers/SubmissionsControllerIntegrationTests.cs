using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class SubmissionsControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SubmissionsControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: SubmissionsController - Get Non Existent Submission Returns NotFound Or Unauthorized
    [Fact]
    public async Task GetSubmissionById_ShouldReturnNotFoundOrUnauthorized_WhenIdDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/submissions/999999");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }
}
