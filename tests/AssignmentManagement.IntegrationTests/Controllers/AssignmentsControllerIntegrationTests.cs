using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class AssignmentsControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AssignmentsControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: AssignmentsController - Get Assignments List Requires Authentication Or Returns Empty/OK
    [Fact]
    public async Task GetAssignments_ShouldReturnStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/assignments");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }

    // Test Name: AssignmentsController - Get Non Existent Assignment Returns NotFound Or Unauthorized
    [Fact]
    public async Task GetAssignment_ShouldReturnNotFoundOrUnauthorized_WhenIdDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/assignments/999999");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound ||
            response.StatusCode == HttpStatusCode.Unauthorized);
    }
}
