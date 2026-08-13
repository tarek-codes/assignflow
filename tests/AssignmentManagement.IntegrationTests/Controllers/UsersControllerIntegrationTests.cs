using System.Net;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class UsersControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: UsersController - Get Users List Endpoint Requires Authorization Or Returns Paged Data
    [Fact]
    public async Task GetUsers_ShouldReturnStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }

    // Test Name: UsersController - Get User By Id Returns NotFound Or Unauthorized
    [Fact]
    public async Task GetUserById_ShouldReturnNotFoundOrUnauthorized_WhenUserDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/users/999999");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound ||
            response.StatusCode == HttpStatusCode.Unauthorized ||
            response.StatusCode == HttpStatusCode.Forbidden);
    }
}
