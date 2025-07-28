using System.Linq;
using System.Security.Claims;
using ASafariM.Api.Data;
using ASafariM.Api.DTOs;
using ASafariM.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASafariM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPreferencesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserPreferencesController> _logger;

        public UserPreferencesController(
            ApplicationDbContext context,
            ILogger<UserPreferencesController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<UserPreferences>>> GetCurrentUserPreferences()
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                var preferences = await _context
                    .UserPreferences.Include(up => up.User)
                    .FirstOrDefaultAsync(up => up.UserId == userGuid);

                if (preferences == null)
                {
                    // Create default preferences if none exist
                    preferences = new UserPreferences
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        Theme = "light",
                        Language = "en",
                        Timezone = "UTC",
                        EmailNotifications = true,
                        PushNotifications = true,
                        ProjectVisibility = "public",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };

                    _context.UserPreferences.Add(preferences);
                    await _context.SaveChangesAsync();
                }

                return Ok(
                    new ApiResponse<UserPreferences>
                    {
                        Success = true,
                        Data = preferences,
                        Message = "User preferences retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user preferences");
                return StatusCode(
                    500,
                    new ApiResponse<UserPreferences>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving user preferences",
                    }
                );
            }
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<ApiResponse<UserPreferences>>> GetUserPreferences(
            Guid userId
        )
        {
            try
            {
                var currentUserId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst("id")?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var currentUserGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                // Handle role claims (can be array in JWT) - try multiple claim types
                var roleClaims = new List<string>();

                // Try different possible role claim types
                var roleClaimTypes = new[]
                {
                    "role",
                    "roles",
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                    ClaimTypes.Role,
                };

                foreach (var claimType in roleClaimTypes)
                {
                    var claims =
                        User?.FindAll(claimType)?.Select(c => c.Value).ToList()
                        ?? new List<string>();
                    if (claims.Any())
                    {
                        _logger.LogInformation(
                            "GetUserPreferences - Found roles in claim type '{ClaimType}': {Roles}",
                            claimType,
                            string.Join(", ", claims)
                        );
                        roleClaims.AddRange(claims);
                    }
                }

                var isAdmin =
                    roleClaims.Contains("Admin")
                    || roleClaims.Contains("SuperAdmin")
                    || roleClaims.Contains("admin")
                    || roleClaims.Contains("superadmin");

                _logger.LogInformation(
                    "GetUserPreferences Permission Check - CurrentUserId: {CurrentUserId}, RequestedUserId: {RequestedUserId}, IsAdmin: {IsAdmin}",
                    currentUserGuid,
                    userId,
                    isAdmin
                );

                // Users can only access their own preferences unless they're admin
                if (currentUserGuid != userId && !isAdmin)
                {
                    _logger.LogWarning(
                        "GetUserPreferences Access Denied - User {CurrentUserId} cannot access preferences for user {RequestedUserId}",
                        currentUserGuid,
                        userId
                    );
                    return Forbid();
                }

                var preferences = await _context
                    .UserPreferences.Include(up => up.User)
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (preferences == null)
                {
                    return NotFound(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User preferences not found",
                        }
                    );
                }

                return Ok(
                    new ApiResponse<UserPreferences>
                    {
                        Success = true,
                        Data = preferences,
                        Message = "User preferences retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user preferences for user {UserId}", userId);
                return StatusCode(
                    500,
                    new ApiResponse<UserPreferences>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving user preferences",
                    }
                );
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<UserPreferences>>> CreateUserPreferences(
            [FromBody] UserPreferences userPreferences
        )
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "Invalid user preferences data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                // Check if user is admin (can create preferences for any user)
                var isAdmin = User.FindAll("role").Any(c => c.Value.Contains("Admin")) ||
                             User.FindAll("roles").Any(c => c.Value.Contains("Admin")) ||
                             User.FindAll(ClaimTypes.Role).Any(c => c.Value.Contains("Admin"));

                // Set the user ID if not provided or ensure it matches current user (unless admin)
                if (userPreferences.UserId == Guid.Empty)
                {
                    userPreferences.UserId = userGuid;
                }
                else if (userPreferences.UserId != userGuid && !isAdmin)
                {
                    return Forbid();
                }

                // Check if preferences already exist for this user
                var existingPreferences = await _context.UserPreferences.FirstOrDefaultAsync(up =>
                    up.UserId == userPreferences.UserId
                );

                if (existingPreferences != null)
                {
                    return Conflict(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User preferences already exist for this user",
                        }
                    );
                }

                userPreferences.Id = Guid.NewGuid();
                userPreferences.CreatedAt = DateTime.UtcNow;
                userPreferences.UpdatedAt = DateTime.UtcNow;

                _context.UserPreferences.Add(userPreferences);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetUserPreferences),
                    new { userId = userPreferences.UserId },
                    new ApiResponse<UserPreferences>
                    {
                        Success = true,
                        Data = userPreferences,
                        Message = "User preferences created successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user preferences");
                return StatusCode(
                    500,
                    new ApiResponse<UserPreferences>
                    {
                        Success = false,
                        Message = "An error occurred while creating user preferences",
                    }
                );
            }
        }

        [HttpPut]
        public async Task<ActionResult<ApiResponse<UserPreferences>>> UpdateCurrentUserPreferences(
            [FromBody] UserPreferences userPreferences
        )
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<UserPreferences>
                        {
                            Success = false,
                            Message = "Invalid user preferences data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                var existingPreferences = await _context.UserPreferences.FirstOrDefaultAsync(up =>
                    up.UserId == userGuid
                );

                if (existingPreferences == null)
                {
                    // Create new preferences if none exist
                    userPreferences.Id = Guid.NewGuid();
                    userPreferences.UserId = userGuid;
                    userPreferences.CreatedAt = DateTime.UtcNow;
                    userPreferences.UpdatedAt = DateTime.UtcNow;

                    _context.UserPreferences.Add(userPreferences);
                }
                else
                {
                    // Update existing preferences
                    existingPreferences.Theme = userPreferences.Theme;
                    existingPreferences.Language = userPreferences.Language;
                    existingPreferences.Timezone = userPreferences.Timezone;
                    existingPreferences.EmailNotifications = userPreferences.EmailNotifications;
                    existingPreferences.PushNotifications = userPreferences.PushNotifications;
                    existingPreferences.ProjectVisibility = userPreferences.ProjectVisibility;
                    existingPreferences.UpdatedAt = DateTime.UtcNow;

                    userPreferences = existingPreferences;
                }

                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<UserPreferences>
                    {
                        Success = true,
                        Data = userPreferences,
                        Message = "User preferences updated successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user preferences");
                return StatusCode(
                    500,
                    new ApiResponse<UserPreferences>
                    {
                        Success = false,
                        Message = "An error occurred while updating user preferences",
                    }
                );
            }
        }

        [HttpDelete]
        public async Task<ActionResult<ApiResponse<object>>> DeleteCurrentUserPreferences()
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<object>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                var preferences = await _context.UserPreferences.FirstOrDefaultAsync(up =>
                    up.UserId == userGuid
                );

                if (preferences == null)
                {
                    return NotFound(
                        new ApiResponse<object>
                        {
                            Success = false,
                            Message = "User preferences not found",
                        }
                    );
                }

                _context.UserPreferences.Remove(preferences);
                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<object>
                    {
                        Success = true,
                        Message = "User preferences deleted successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user preferences");
                return StatusCode(
                    500,
                    new ApiResponse<object>
                    {
                        Success = false,
                        Message = "An error occurred while deleting user preferences",
                    }
                );
            }
        }
    }
}
