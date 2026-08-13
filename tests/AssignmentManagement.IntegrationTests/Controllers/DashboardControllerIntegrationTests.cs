using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class DashboardControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DashboardControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: DashboardController - Admin Endpoint Requires Authorization
    [Fact]
    public async Task GetAdminDashboard_ShouldReturnUnauthorizedOrForbidden_WhenUnauthenticated()
    {
        // Act
        var response = await _client.GetAsync("/api/dashboard/admin");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }
}
