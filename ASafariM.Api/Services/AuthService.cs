using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ASafariM.Api.Data;
using ASafariM.Api.DTOs;
using ASafariM.Api.Models;

namespace ASafariM.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegistrationDto registrationDto)
        {
            try
            {
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == registrationDto.Email))
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("User with this email already exists.", statusCode: 409);
                }

                if (await _context.Users.AnyAsync(u => u.Username == registrationDto.Username))
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("Username is already taken.", statusCode: 409);
                }

                // Create new user
                var user = new User
                {
                    Username = registrationDto.Username,
                    Email = registrationDto.Email,
                    FirstName = registrationDto.FirstName,
                    LastName = registrationDto.LastName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                    Role = "User",
                    IsEmailVerified = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate tokens
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                var response = new AuthResponseDto
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(24),
                    User = MapToUserDto(user)
                };

                return ApiResponse<AuthResponseDto>.SuccessResult(response, "User registered successfully.", 201);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user registration");
                return ApiResponse<AuthResponseDto>.ErrorResult("An error occurred during registration.", statusCode: 500);
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(UserLoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.EmailOrUsername || u.Username == loginDto.EmailOrUsername);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("Invalid credentials.", statusCode: 401);
                }

                if (!user.IsActive)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResult("Account is disabled.", statusCode: 403);
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generate tokens
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                var response = new AuthResponseDto
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(24),
                    User = MapToUserDto(user)
                };

                return ApiResponse<AuthResponseDto>.SuccessResult(response, "Login successful.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login");
                return ApiResponse<AuthResponseDto>.ErrorResult("An error occurred during login.", statusCode: 500);
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            // Implementation for refresh token logic
            // This would typically involve validating the refresh token and generating new tokens
            await Task.CompletedTask;
            return ApiResponse<AuthResponseDto>.ErrorResult("Refresh token functionality not implemented yet.", statusCode: 501);
        }

        public async Task<ApiResponse<object>> LogoutAsync(string userId)
        {
            // Implementation for logout logic
            // This would typically involve invalidating the user's tokens
            await Task.CompletedTask;
            return ApiResponse<object>.SuccessResult(null, "Logout successful.");
        }

        public async Task<ApiResponse<object>> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return ApiResponse<object>.ErrorResult("User not found.", statusCode: 404);
                }

                if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                {
                    return ApiResponse<object>.ErrorResult("Current password is incorrect.", statusCode: 400);
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
                await _context.SaveChangesAsync();

                return ApiResponse<object>.SuccessResult(null, "Password changed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during password change");
                return ApiResponse<object>.ErrorResult("An error occurred while changing password.", statusCode: 500);
            }
        }

        public async Task<ApiResponse<object>> SendEmailVerificationAsync(string userId)
        {
            // Implementation for sending email verification
            await Task.CompletedTask;
            return ApiResponse<object>.SuccessResult(null, "Verification email sent.");
        }

        public async Task<ApiResponse<object>> VerifyEmailAsync(string userId, string token)
        {
            // Implementation for email verification
            await Task.CompletedTask;
            return ApiResponse<object>.SuccessResult(null, "Email verified successfully.");
        }

        public async Task<ApiResponse<object>> SendPasswordResetAsync(string email)
        {
            // Implementation for sending password reset email
            await Task.CompletedTask;
            return ApiResponse<object>.SuccessResult(null, "Password reset email sent.");
        }

        public async Task<ApiResponse<object>> ResetPasswordAsync(string email, string token, string newPassword)
        {
            // Implementation for password reset
            await Task.CompletedTask;
            return ApiResponse<object>.SuccessResult(null, "Password reset successful.");
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<User?> GetUserFromTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return null;
                }

                return await _context.Users.FindAsync(userId);
            }
            catch
            {
                return null;
            }
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("sub", user.Id.ToString()),
                    new Claim("id", user.Id.ToString()),
                    new Claim("name", user.Username),
                    new Claim("email", user.Email),
                    new Claim("role", user.Role),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Avatar = user.Avatar,
                Bio = user.Bio,
                Website = user.Website,
                Location = user.Location,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                EmailVerifiedAt = user.EmailVerifiedAt,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsActive = user.IsActive
            };
        }
    }
}
