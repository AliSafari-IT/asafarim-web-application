using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ASafariM.Api.DTOs;
using ASafariM.Api.Services;

namespace ASafariM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] UserRegistrationDto registrationDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                var errorResponse = ApiResponse<AuthResponseDto>.ErrorResult("Validation failed.", errors, 400);
                return BadRequest(errorResponse);
            }

            var result = await _authService.RegisterAsync(registrationDto);
            
            return result.StatusCode switch
            {
                201 => Created("", result),
                409 => Conflict(result),
                _ => StatusCode(result.StatusCode, result)
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] UserLoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                var errorResponse = ApiResponse<AuthResponseDto>.ErrorResult("Validation failed.", errors, 400);
                return BadRequest(errorResponse);
            }

            var result = await _authService.LoginAsync(loginDto);
            
            return result.StatusCode switch
            {
                200 => Ok(result),
                401 => Unauthorized(result),
                403 => StatusCode(403, result),
                _ => StatusCode(result.StatusCode, result)
            };
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                var errorResponse = ApiResponse<AuthResponseDto>.ErrorResult("Validation failed.", errors, 400);
                return BadRequest(errorResponse);
            }

            var result = await _authService.RefreshTokenAsync(refreshTokenDto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> Logout()
        {
            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401));
            }

            var result = await _authService.LogoutAsync(userId);
            return Ok(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                var errorResponse = ApiResponse<object>.ErrorResult("Validation failed.", errors, 400);
                return BadRequest(errorResponse);
            }

            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401));
            }

            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("send-email-verification")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<object>>> SendEmailVerification()
        {
            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401));
            }

            var result = await _authService.SendEmailVerificationAsync(userId);
            return Ok(result);
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult<ApiResponse<object>>> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return BadRequest(ApiResponse<object>.ErrorResult("UserId and token are required.", statusCode: 400));
            }

            var result = await _authService.VerifyEmailAsync(userId, token);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("send-password-reset")]
        public async Task<ActionResult<ApiResponse<object>>> SendPasswordReset([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Email is required.", statusCode: 400));
            }

            var result = await _authService.SendPasswordResetAsync(email);
            return Ok(result);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromQuery] string email, [FromQuery] string token, [FromBody] string newPassword)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token) || string.IsNullOrEmpty(newPassword))
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Email, token, and new password are required.", statusCode: 400));
            }

            var result = await _authService.ResetPasswordAsync(email, token, newPassword);
            return StatusCode(result.StatusCode, result);
        }
    }
}
