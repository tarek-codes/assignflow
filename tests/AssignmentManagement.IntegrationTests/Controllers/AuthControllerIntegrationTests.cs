using System.Net;
using System.Net.Http.Json;
using AssignmentManagement.Application.DTOs.Authentication;
using Xunit;

namespace AssignmentManagement.IntegrationTests.Controllers;

public class AuthControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Test Name: AuthController - Login Fails For Non-Existent User Credentials
    [Fact]
    public async Task Login_ShouldReturnUnauthorizedOrBadRequest_WhenUserDoesNotExist()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "nonexistent.user@assignflow.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        Assert.True(response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.BadRequest);
    }

    // Test Name: AuthController - CheckEmail Endpoint Returns Availability Status
    [Fact]
    public async Task CheckEmail_ShouldReturnOk_WhenQueried()
    {
        // Arrange
        const string testEmail = "random.check@assignflow.com";

        // Act
        var response = await _client.GetAsync($"/api/auth/check-email?email={testEmail}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
