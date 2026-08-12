using AssignmentManagement.Api.Extensions;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Api.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

    public int? UserId => _httpContextAccessor.HttpContext?.User.GetUserId();

    public string? Email => _httpContextAccessor.HttpContext?.User.GetEmail();

    public string? FullName => _httpContextAccessor.HttpContext?.User.GetFullName();

    public UserRole? Role => _httpContextAccessor.HttpContext?.User.GetRoleValue();
}