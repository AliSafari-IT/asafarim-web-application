using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ASafariM.Api.Data;
using ASafariM.Api.DTOs;
using ASafariM.Api.Models;

namespace ASafariM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(ApplicationDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetCurrentUserProfile()
        {
            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<UserProfileDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var user = await _context.Users
                    .Where(u => u.Id == userGuid && u.IsActive && !u.IsDeleted)
                    .Select(u => new UserProfileDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Email = u.Email,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Avatar = u.Avatar,
                        Bio = u.Bio,
                        Website = u.Website,
                        Location = u.Location,
                        IsEmailVerified = u.IsEmailVerified,
                        CreatedAt = u.CreatedAt,
                        ProjectsCount = u.Projects.Count(p => p.IsActive && !p.IsDeleted),
                        RepositoriesCount = u.Repositories.Count(r => r.IsActive && !r.IsDeleted)
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(ApiResponse<UserProfileDto>.ErrorResult("User not found.", statusCode: 404));
                }

                return Ok(ApiResponse<UserProfileDto>.SuccessResult(user, "Profile retrieved successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user profile");
                return StatusCode(500, ApiResponse<UserProfileDto>.ErrorResult(
                    "An error occurred while retrieving the profile.", statusCode: 500));
            }
        }

        [HttpGet("{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserProfile(string username)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Username == username && u.IsActive && !u.IsDeleted)
                    .Select(u => new UserProfileDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Email = u.Email, // You might want to hide this for privacy
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Avatar = u.Avatar,
                        Bio = u.Bio,
                        Website = u.Website,
                        Location = u.Location,
                        IsEmailVerified = u.IsEmailVerified,
                        CreatedAt = u.CreatedAt,
                        ProjectsCount = u.Projects.Count(p => p.IsActive && !p.IsDeleted && p.IsPublic),
                        RepositoriesCount = u.Repositories.Count(r => r.IsActive && !r.IsDeleted && !r.IsPrivate)
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(ApiResponse<UserProfileDto>.ErrorResult("User not found.", statusCode: 404));
                }

                // Hide email for public profiles
                user.Email = string.Empty;

                return Ok(ApiResponse<UserProfileDto>.SuccessResult(user, "Profile retrieved successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user profile for {Username}", username);
                return StatusCode(500, ApiResponse<UserProfileDto>.ErrorResult(
                    "An error occurred while retrieving the profile.", statusCode: 500));
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateUserProfileDto updateProfileDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(ApiResponse<UserDto>.ErrorResult("Validation failed.", errors, 400));
            }

            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<UserDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userGuid && u.IsActive && !u.IsDeleted);

                if (user == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResult("User not found.", statusCode: 404));
                }

                // Update only provided fields
                if (updateProfileDto.FirstName != null)
                    user.FirstName = updateProfileDto.FirstName;
                
                if (updateProfileDto.LastName != null)
                    user.LastName = updateProfileDto.LastName;
                
                if (updateProfileDto.Bio != null)
                    user.Bio = updateProfileDto.Bio;
                
                if (updateProfileDto.Website != null)
                    user.Website = updateProfileDto.Website;
                
                if (updateProfileDto.Location != null)
                    user.Location = updateProfileDto.Location;
                
                if (updateProfileDto.Avatar != null)
                    user.Avatar = updateProfileDto.Avatar;

                await _context.SaveChangesAsync();

                var userDto = new UserDto
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

                return Ok(ApiResponse<UserDto>.SuccessResult(userDto, "Profile updated successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user profile");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult(
                    "An error occurred while updating the profile.", statusCode: 500));
            }
        }

        [HttpGet("preferences")]
        public async Task<ActionResult<ApiResponse<UserPreferencesDto>>> GetUserPreferences()
        {
            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<UserPreferencesDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var preferences = await _context.UserPreferences
                    .Where(up => up.UserId == userGuid && up.IsActive && !up.IsDeleted)
                    .FirstOrDefaultAsync();

                UserPreferencesDto preferencesDto;
                if (preferences == null)
                {
                    // Return default preferences if none exist
                    preferencesDto = new UserPreferencesDto();
                }
                else
                {
                    preferencesDto = new UserPreferencesDto
                    {
                        Theme = preferences.Theme,
                        Language = preferences.Language,
                        Timezone = preferences.Timezone,
                        EmailNotifications = preferences.EmailNotifications,
                        PushNotifications = preferences.PushNotifications,
                        ProjectVisibility = preferences.ProjectVisibility
                    };
                }

                return Ok(ApiResponse<UserPreferencesDto>.SuccessResult(preferencesDto, "User preferences retrieved successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user preferences");
                return StatusCode(500, ApiResponse<UserPreferencesDto>.ErrorResult(
                    "An error occurred while retrieving user preferences.", statusCode: 500));
            }
        }

        [HttpPut("preferences")]
        public async Task<ActionResult<ApiResponse<UserPreferencesDto>>> UpdateUserPreferences([FromBody] UpdateUserPreferencesDto updatePreferencesDto)
        {
            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<UserPreferencesDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var preferences = await _context.UserPreferences
                    .Where(up => up.UserId == userGuid && up.IsActive && !up.IsDeleted)
                    .FirstOrDefaultAsync();

                if (preferences == null)
                {
                    // Create new preferences if none exist
                    preferences = new UserPreferences
                    {
                        UserId = userGuid,
                        Theme = updatePreferencesDto.Theme ?? "light",
                        Language = updatePreferencesDto.Language ?? "en",
                        Timezone = updatePreferencesDto.Timezone ?? "UTC",
                        EmailNotifications = updatePreferencesDto.EmailNotifications ?? true,
                        PushNotifications = updatePreferencesDto.PushNotifications ?? true,
                        ProjectVisibility = updatePreferencesDto.ProjectVisibility ?? "public"
                    };
                    _context.UserPreferences.Add(preferences);
                }
                else
                {
                    // Update existing preferences
                    if (updatePreferencesDto.Theme != null)
                        preferences.Theme = updatePreferencesDto.Theme;
                    
                    if (updatePreferencesDto.Language != null)
                        preferences.Language = updatePreferencesDto.Language;
                    
                    if (updatePreferencesDto.Timezone != null)
                        preferences.Timezone = updatePreferencesDto.Timezone;
                    
                    if (updatePreferencesDto.EmailNotifications.HasValue)
                        preferences.EmailNotifications = updatePreferencesDto.EmailNotifications.Value;
                    
                    if (updatePreferencesDto.PushNotifications.HasValue)
                        preferences.PushNotifications = updatePreferencesDto.PushNotifications.Value;
                    
                    if (updatePreferencesDto.ProjectVisibility != null)
                        preferences.ProjectVisibility = updatePreferencesDto.ProjectVisibility;
                }

                await _context.SaveChangesAsync();

                var preferencesDto = new UserPreferencesDto
                {
                    Theme = preferences.Theme,
                    Language = preferences.Language,
                    Timezone = preferences.Timezone,
                    EmailNotifications = preferences.EmailNotifications,
                    PushNotifications = preferences.PushNotifications,
                    ProjectVisibility = preferences.ProjectVisibility
                };

                return Ok(ApiResponse<UserPreferencesDto>.SuccessResult(preferencesDto, "User preferences updated successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user preferences");
                return StatusCode(500, ApiResponse<UserPreferencesDto>.ErrorResult(
                    "An error occurred while updating user preferences.", statusCode: 500));
            }
        }

        [HttpGet("projects")]
        public async Task<ActionResult<PaginatedResponse<ProjectSummaryDto>>> GetUserProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<List<ProjectSummaryDto>>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var query = _context.Projects
                    .Include(p => p.User)
                    .Include(p => p.TechStack)
                    .Where(p => p.UserId == userGuid && p.IsActive && !p.IsDeleted);

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => p.Title.Contains(search) || 
                                           (p.Description != null && p.Description.Contains(search)));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(p => p.Status == status);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var projects = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProjectSummaryDto
                    {
                        Id = p.Id,
                        Title = p.Title,
                        Description = p.Description,
                        Status = p.Status,
                        Priority = p.Priority,
                        Progress = p.Progress,
                        Tags = p.Tags,
                        ThumbnailUrl = p.ThumbnailUrl,
                        IsPublic = p.IsPublic,
                        IsFeatured = p.IsFeatured,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt,
                        UserUsername = p.User.Username,
                        TechStackName = p.TechStack != null ? p.TechStack.Name : null
                    })
                    .ToListAsync();

                var response = PaginatedResponse<ProjectSummaryDto>.SuccessResult(
                    projects, page, totalPages, totalCount, pageSize, "User projects retrieved successfully.");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user projects");
                return StatusCode(500, ApiResponse<List<ProjectSummaryDto>>.ErrorResult(
                    "An error occurred while retrieving projects.", statusCode: 500));
            }
        }

        [HttpGet("repositories")]
        public async Task<ActionResult<PaginatedResponse<RepositoryDto>>> GetUserRepositories(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? language = null,
            [FromQuery] bool? isPrivate = null)
        {
            try
            {
                var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                    ?? User?.FindFirst("sub")?.Value 
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<List<RepositoryDto>>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var query = _context.Repositories
                    .Include(r => r.User)
                    .Include(r => r.Project)
                    .Where(r => r.UserId == userGuid && r.IsActive && !r.IsDeleted);

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(r => r.Name.Contains(search) || 
                                           (r.Description != null && r.Description.Contains(search)));
                }

                if (!string.IsNullOrEmpty(language))
                {
                    query = query.Where(r => r.Language == language);
                }

                if (isPrivate.HasValue)
                {
                    query = query.Where(r => r.IsPrivate == isPrivate.Value);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var repositories = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new RepositoryDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description,
                        Url = r.Url,
                        Provider = r.Provider,
                        Language = r.Language,
                        Stars = r.Stars,
                        Forks = r.Forks,
                        Issues = r.Issues,
                        LastCommitAt = r.LastCommitAt,
                        License = r.License,
                        Topics = r.Topics,
                        IsPrivate = r.IsPrivate,
                        IsFork = r.IsFork,
                        IsArchived = r.IsArchived,
                        Size = r.Size,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt,
                        UserId = r.UserId,
                        UserUsername = r.User.Username,
                        ProjectId = r.ProjectId,
                        ProjectTitle = r.Project != null ? r.Project.Title : null
                    })
                    .ToListAsync();

                var response = PaginatedResponse<RepositoryDto>.SuccessResult(
                    repositories, page, totalPages, totalCount, pageSize, "User repositories retrieved successfully.");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user repositories");
                return StatusCode(500, ApiResponse<List<RepositoryDto>>.ErrorResult(
                    "An error occurred while retrieving repositories.", statusCode: 500));
            }
        }
    }
}
