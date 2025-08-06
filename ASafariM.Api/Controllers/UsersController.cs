using System.Linq;
using System.Security.Claims;
using ASafariM.Api.Data;
using ASafariM.Api.DTOs;
using ASafariM.Api.Models;
using ASafariM.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                var userId =
                    User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<UserProfileDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var user = await _context
                    .Users.Where(u => u.Id == userGuid && u.IsActive && !u.IsDeleted)
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
                        RepositoriesCount = u.Repositories.Count(r => r.IsActive && !r.IsDeleted),
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<UserProfileDto>.ErrorResult("User not found.", statusCode: 404)
                    );
                }

                return Ok(
                    ApiResponse<UserProfileDto>.SuccessResult(
                        user,
                        "Profile retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user profile");
                return StatusCode(
                    500,
                    ApiResponse<UserProfileDto>.ErrorResult(
                        "An error occurred while retrieving the profile.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserProfile(string username)
        {
            try
            {
                var user = await _context
                    .Users.Where(u => u.Username == username && u.IsActive && !u.IsDeleted)
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
                        RepositoriesCount = u.Repositories.Count(r => r.IsActive && !r.IsDeleted),
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<UserProfileDto>.ErrorResult("User not found.", statusCode: 404)
                    );
                }

                return Ok(
                    ApiResponse<UserProfileDto>.SuccessResult(
                        user,
                        "Profile retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user profile");
                return StatusCode(
                    500,
                    ApiResponse<UserProfileDto>.ErrorResult(
                        "An error occurred while retrieving the profile.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile(
            [FromBody] UpdateUserProfileDto updateProfileDto
        )
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(
                    ApiResponse<UserDto>.ErrorResult("Validation failed.", errors, 400)
                );
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<UserDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var user = await _context
                    .Users.FirstOrDefaultAsync(u => u.Id == userGuid && u.IsActive && !u.IsDeleted);

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<UserDto>.ErrorResult("User not found.", statusCode: 404)
                    );
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(updateProfileDto.FirstName))
                    user.FirstName = updateProfileDto.FirstName;

                if (!string.IsNullOrEmpty(updateProfileDto.LastName))
                    user.LastName = updateProfileDto.LastName;

                if (!string.IsNullOrEmpty(updateProfileDto.Bio))
                    user.Bio = updateProfileDto.Bio;

                if (!string.IsNullOrEmpty(updateProfileDto.Website))
                    user.Website = updateProfileDto.Website;

                if (!string.IsNullOrEmpty(updateProfileDto.Location))
                    user.Location = updateProfileDto.Location;

                if (!string.IsNullOrEmpty(updateProfileDto.Avatar))
                    user.Avatar = updateProfileDto.Avatar;

                user.UpdatedAt = DateTime.UtcNow;

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
                    IsEmailVerified = user.IsEmailVerified,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                };

                return Ok(
                    ApiResponse<UserDto>.SuccessResult(userDto, "Profile updated successfully.")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user profile");
                return StatusCode(
                    500,
                    ApiResponse<UserDto>.ErrorResult(
                        "An error occurred while updating the profile.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("preferences")]
        public async Task<ActionResult<ApiResponse<UserPreferencesDto>>> GetUserPreferences()
        {
            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<UserPreferencesDto>.ErrorResult("Invalid token.", statusCode: 401)
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
                        UserId = userGuid,
                        Theme = "light",
                        Language = "en",
                        Timezone = "UTC",
                        EmailNotifications = true,
                        PushNotifications = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };

                    _context.UserPreferences.Add(preferences);
                    await _context.SaveChangesAsync();
                }

                var preferencesDto = new UserPreferencesDto
                {
                    Id = preferences.Id,
                    Theme = preferences.Theme,
                    Language = preferences.Language,
                    Timezone = preferences.Timezone,
                    EmailNotifications = preferences.EmailNotifications,
                    PushNotifications = preferences.PushNotifications,
                    CreatedAt = preferences.CreatedAt,
                    UpdatedAt = preferences.UpdatedAt,
                };

                return Ok(
                    ApiResponse<UserPreferencesDto>.SuccessResult(
                        preferencesDto,
                        "User preferences retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user preferences");
                return StatusCode(
                    500,
                    ApiResponse<UserPreferencesDto>.ErrorResult(
                        "An error occurred while retrieving user preferences.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpPut("preferences")]
        public async Task<ActionResult<ApiResponse<UserPreferencesDto>>> UpdateUserPreferences(
            [FromBody] UpdateUserPreferencesDto updatePreferencesDto
        )
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(
                    ApiResponse<UserPreferencesDto>.ErrorResult("Validation failed.", errors, 400)
                );
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<UserPreferencesDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var preferences = await _context
                    .UserPreferences.FirstOrDefaultAsync(up => up.UserId == userGuid);

                if (preferences == null)
                {
                    return NotFound(
                        ApiResponse<UserPreferencesDto>.ErrorResult("User preferences not found.", statusCode: 404)
                    );
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(updatePreferencesDto.Theme))
                    preferences.Theme = updatePreferencesDto.Theme;

                if (!string.IsNullOrEmpty(updatePreferencesDto.Language))
                    preferences.Language = updatePreferencesDto.Language;

                if (!string.IsNullOrEmpty(updatePreferencesDto.Timezone))
                    preferences.Timezone = updatePreferencesDto.Timezone;

                if (updatePreferencesDto.EmailNotifications.HasValue)
                    preferences.EmailNotifications = updatePreferencesDto.EmailNotifications.Value;

                if (updatePreferencesDto.PushNotifications.HasValue)
                    preferences.PushNotifications = updatePreferencesDto.PushNotifications.Value;

                preferences.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var preferencesDto = new UserPreferencesDto
                {
                    Id = preferences.Id,
                    Theme = preferences.Theme,
                    Language = preferences.Language,
                    Timezone = preferences.Timezone,
                    EmailNotifications = preferences.EmailNotifications,
                    PushNotifications = preferences.PushNotifications,
                    CreatedAt = preferences.CreatedAt,
                    UpdatedAt = preferences.UpdatedAt,
                };

                return Ok(
                    ApiResponse<UserPreferencesDto>.SuccessResult(
                        preferencesDto,
                        "User preferences updated successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user preferences");
                return StatusCode(
                    500,
                    ApiResponse<UserPreferencesDto>.ErrorResult(
                        "An error occurred while updating user preferences.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("projects")]
        public async Task<ActionResult<PaginatedResponse<ProjectSummaryDto>>> GetUserProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null
        )
        {
            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<List<ProjectSummaryDto>>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var query = _context
                    .Projects.Include(p => p.User)
                    .Include(p => p.ProjectTechStacks)
                    .ThenInclude(pts => pts.TechStack)
                    .Where(p => p.UserId == userGuid && p.IsActive && !p.IsDeleted)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p =>
                        p.Title.Contains(search)
                        || (p.Description != null && p.Description.Contains(search))
                    );
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
                        TechStackIds = p
                            .ProjectTechStacks.Select(pts => pts.TechStackId.ToString())
                            .ToList(),
                        TechStacks = p
                            .ProjectTechStacks.Select(pts => new TechStackDto
                            {
                                Id = pts.TechStack.Id,
                                Name = pts.TechStack.Name,
                                Description = pts.TechStack.Description,
                                Category = pts.TechStack.Category,
                                TechVersion = pts.TechStack.TechVersion ?? string.Empty,
                                IconUrl = pts.TechStack.IconUrl ?? string.Empty,
                                DocumentationUrl = pts.TechStack.DocumentationUrl ?? string.Empty,
                                OfficialWebsite = pts.TechStack.OfficialWebsite ?? string.Empty,
                                Features = new List<string>(),
                                IsActive = pts.TechStack.IsActive,
                                PopularityRating = 0,
                                CreatedAt = pts.TechStack.CreatedAt,
                                UpdatedAt = pts.TechStack.UpdatedAt,
                                ProjectsCount = 0,
                            })
                            .ToList(),
                    })
                    .ToListAsync();

                var response = PaginatedResponse<ProjectSummaryDto>.SuccessResult(
                    projects,
                    page,
                    totalPages,
                    totalCount,
                    pageSize,
                    "User projects retrieved successfully."
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user projects");
                return StatusCode(
                    500,
                    ApiResponse<List<ProjectSummaryDto>>.ErrorResult(
                        "An error occurred while retrieving projects.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("repositories")]
        public async Task<ActionResult<PaginatedResponse<RepositoryDto>>> GetUserRepositories(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? language = null,
            [FromQuery] bool? isPrivate = null
        )
        {
            try
            {
                var userId =
                    User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<List<RepositoryDto>>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var query = _context
                    .Repositories.Include(r => r.User)
                    .Include(r => r.Project)
                    .Where(r => r.UserId == userGuid && r.IsActive && !r.IsDeleted)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(r =>
                        r.Name.Contains(search)
                        || (r.Description != null && r.Description.Contains(search))
                    );
                }

                // Apply language filter
                if (!string.IsNullOrEmpty(language))
                {
                    query = query.Where(r => r.Language == language);
                }

                // Apply privacy filter
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
                        UserUsername = r.User != null ? r.User.Username : string.Empty,
                        ProjectId = r.ProjectId,
                        ProjectTitle = r.Project != null ? r.Project.Title : null,
                    })
                    .ToListAsync();

                var response = PaginatedResponse<RepositoryDto>.SuccessResult(
                    repositories,
                    page,
                    totalPages,
                    totalCount,
                    pageSize,
                    "User repositories retrieved successfully."
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user repositories");
                return StatusCode(
                    500,
                    ApiResponse<List<RepositoryDto>>.ErrorResult(
                        "An error occurred while retrieving repositories.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("admin/all")]
        public async Task<ActionResult<PaginatedResponse<UserDto>>> GetAllUsersForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? role = null,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] string sortOrder = "desc"
        )
        {
            try
            {
                var query = _context.Users.AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(u =>
                        u.Username.Contains(searchTerm)
                        || u.Email.Contains(searchTerm)
                        || (u.FirstName != null && u.FirstName.Contains(searchTerm))
                        || (u.LastName != null && u.LastName.Contains(searchTerm))
                    );
                }

                // Apply role filter (if implemented)
                if (!string.IsNullOrEmpty(role))
                {
                    // This would need to be implemented based on your role system
                    // For now, we'll skip role filtering
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                // Apply sorting
                query = sortBy.ToLower() switch
                {
                    "username" => sortOrder.ToLower() == "asc"
                        ? query.OrderBy(u => u.Username)
                        : query.OrderByDescending(u => u.Username),
                    "email" => sortOrder.ToLower() == "asc"
                        ? query.OrderBy(u => u.Email)
                        : query.OrderByDescending(u => u.Email),
                    "createdat" or "created" => sortOrder.ToLower() == "asc"
                        ? query.OrderBy(u => u.CreatedAt)
                        : query.OrderByDescending(u => u.CreatedAt),
                    _ => sortOrder.ToLower() == "asc"
                        ? query.OrderBy(u => u.CreatedAt)
                        : query.OrderByDescending(u => u.CreatedAt),
                };

                var users = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new UserDto
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
                        UpdatedAt = u.UpdatedAt,
                    })
                    .ToListAsync();

                var response = PaginatedResponse<UserDto>.SuccessResult(
                    users,
                    page,
                    totalPages,
                    totalCount,
                    pageSize,
                    $"Admin: Retrieved {users.Count} of {totalCount} users successfully."
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving users for admin");
                return StatusCode(
                    500,
                    ApiResponse<List<UserDto>>.ErrorResult(
                        "An error occurred while retrieving users for admin.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpPut("admin/{userId}/profile")]
        public async Task<ActionResult<ApiResponse<UserDto>>> AdminUpdateUserProfile(
            Guid userId,
            [FromBody] UpdateUserProfileDto updateProfileDto
        )
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(
                    ApiResponse<UserDto>.ErrorResult("Validation failed.", errors, 400)
                );
            }

            try
            {
                var adminUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(adminUserId) || !Guid.TryParse(adminUserId, out var adminUserGuid))
                {
                    return Unauthorized(
                        ApiResponse<UserDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                // Check if admin user exists and has admin role
                var adminUser = await _context
                    .Users.FirstOrDefaultAsync(u => u.Id == adminUserGuid && u.IsActive && !u.IsDeleted);

                if (adminUser == null)
                {
                    return Unauthorized(
                        ApiResponse<UserDto>.ErrorResult("Admin user not found.", statusCode: 401)
                    );
                }

                // Check if user is admin (you might want to implement proper role checking)
                var isAdmin = User?.IsInRole("Admin") ?? false;
                if (!isAdmin)
                {
                    return Forbid();
                }

                var user = await _context
                    .Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<UserDto>.ErrorResult("User not found.", statusCode: 404)
                    );
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(updateProfileDto.FirstName))
                    user.FirstName = updateProfileDto.FirstName;

                if (!string.IsNullOrEmpty(updateProfileDto.LastName))
                    user.LastName = updateProfileDto.LastName;

                if (!string.IsNullOrEmpty(updateProfileDto.Bio))
                    user.Bio = updateProfileDto.Bio;

                if (!string.IsNullOrEmpty(updateProfileDto.Website))
                    user.Website = updateProfileDto.Website;

                if (!string.IsNullOrEmpty(updateProfileDto.Location))
                    user.Location = updateProfileDto.Location;

                if (!string.IsNullOrEmpty(updateProfileDto.Avatar))
                    user.Avatar = updateProfileDto.Avatar;

                user.UpdatedAt = DateTime.UtcNow;

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
                    IsEmailVerified = user.IsEmailVerified,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                };

                return Ok(
                    ApiResponse<UserDto>.SuccessResult(userDto, "User profile updated successfully by admin.")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while admin updating user profile {UserId}", userId);
                return StatusCode(
                    500,
                    ApiResponse<UserDto>.ErrorResult(
                        "An error occurred while updating the user profile.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpDelete("admin/{userId}")]
        public async Task<ActionResult<ApiResponse<object>>> AdminDeleteUser(Guid userId)
        {
            try
            {
                var adminUserId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(adminUserId) || !Guid.TryParse(adminUserId, out var adminUserGuid))
                {
                    return Unauthorized(
                        ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                // Check if admin user exists and has admin role
                var adminUser = await _context
                    .Users.FirstOrDefaultAsync(u => u.Id == adminUserGuid && u.IsActive && !u.IsDeleted);

                if (adminUser == null)
                {
                    return Unauthorized(
                        ApiResponse<object>.ErrorResult("Admin user not found.", statusCode: 401)
                    );
                }

                // Check if user is admin (you might want to implement proper role checking)
                var isAdmin = User?.IsInRole("Admin") ?? false;
                if (!isAdmin)
                {
                    return Forbid();
                }

                var user = await _context
                    .Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResult("User not found.", statusCode: 404)
                    );
                }

                // Prevent admin from deleting themselves
                if (user.Id == adminUserGuid)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResult("Admin cannot delete their own account.", statusCode: 400)
                    );
                }

                // Soft delete
                user.IsDeleted = true;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(
                    ApiResponse<object>.SuccessResult(default(object)!, "User deleted successfully by admin.")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while admin deleting user {UserId}", userId);
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResult(
                        "An error occurred while deleting the user.",
                        statusCode: 500
                    )
                );
            }
        }
    }
}
