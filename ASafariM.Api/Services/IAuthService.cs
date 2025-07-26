using ASafariM.Api.DTOs;
using ASafariM.Api.Models;

namespace ASafariM.Api.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegistrationDto registrationDto);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(UserLoginDto loginDto);
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<ApiResponse<object>> LogoutAsync(string userId);
        Task<ApiResponse<object>> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<ApiResponse<object>> SendEmailVerificationAsync(string userId);
        Task<ApiResponse<object>> VerifyEmailAsync(string userId, string token);
        Task<ApiResponse<object>> SendPasswordResetAsync(string email);
        Task<ApiResponse<object>> ResetPasswordAsync(string email, string token, string newPassword);
        Task<bool> ValidateTokenAsync(string token);
        Task<User?> GetUserFromTokenAsync(string token);
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
    }
}
