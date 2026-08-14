using AssignmentManagement.Application.DTOs.Authentication;

namespace AssignmentManagement.Application.Abstractions.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default);

    Task LogoutAsync(CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(ChangePasswordRequestDto request, CancellationToken cancellationToken = default);

    Task UpdateAvatarAsync(UpdateAvatarRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> CheckEmailExistsAsync(string email, CancellationToken cancellationToken = default);
}