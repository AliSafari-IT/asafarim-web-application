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
    public class RepositoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RepositoriesController> _logger;

        public RepositoriesController(
            ApplicationDbContext context,
            ILogger<RepositoriesController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Repository>>>> GetRepositories(
            [FromQuery] string? userId = null,
            [FromQuery] string? language = null,
            [FromQuery] bool? isPrivate = null
        )
        {
            try
            {
                var query = _context.Repositories.Include(r => r.User).AsQueryable();

                // Filter by user if specified
                if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid))
                {
                    query = query.Where(r => r.UserId == userGuid);
                }

                // Filter by language if specified
                if (!string.IsNullOrEmpty(language))
                {
                    query = query.Where(r =>
                        r.Language != null && r.Language.ToLower().Contains(language.ToLower())
                    );
                }

                // Filter by privacy if specified
                if (isPrivate.HasValue)
                {
                    query = query.Where(r => r.IsPrivate == isPrivate.Value);
                }

                var repositories = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

                return Ok(
                    new ApiResponse<IEnumerable<Repository>>
                    {
                        Success = true,
                        Data = repositories,
                        Message = "Repositories retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving repositories");
                return StatusCode(
                    500,
                    new ApiResponse<IEnumerable<Repository>>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving repositories",
                    }
                );
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Repository>>> GetRepository(Guid id)
        {
            try
            {
                var repository = await _context
                    .Repositories.Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (repository == null)
                {
                    return NotFound(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "Repository not found",
                        }
                    );
                }

                return Ok(
                    new ApiResponse<Repository>
                    {
                        Success = true,
                        Data = repository,
                        Message = "Repository retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving repository with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<Repository>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving the repository",
                    }
                );
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Repository>>> CreateRepository(
            [FromBody] Repository repository
        )
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "Invalid repository data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                // Get current user ID from claims
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "User not authenticated",
                        }
                    );
                }

                // Set the user ID if not provided
                if (repository.UserId == Guid.Empty)
                {
                    repository.UserId = userGuid;
                }

                // Check if repository with same URL already exists for this user
                var existingRepository = await _context.Repositories.FirstOrDefaultAsync(r =>
                    r.Url.ToLower() == repository.Url.ToLower() && r.UserId == repository.UserId
                );

                if (existingRepository != null)
                {
                    return Conflict(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "A repository with this URL already exists for this user",
                        }
                    );
                }

                repository.Id = Guid.NewGuid();
                repository.CreatedAt = DateTime.UtcNow;
                repository.UpdatedAt = DateTime.UtcNow;

                _context.Repositories.Add(repository);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetRepository),
                    new { id = repository.Id },
                    new ApiResponse<Repository>
                    {
                        Success = true,
                        Data = repository,
                        Message = "Repository created successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating repository");
                return StatusCode(
                    500,
                    new ApiResponse<Repository>
                    {
                        Success = false,
                        Message = "An error occurred while creating the repository",
                    }
                );
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Repository>>> UpdateRepository(
            Guid id,
            [FromBody] Repository repository
        )
        {
            try
            {
                if (id != repository.Id)
                {
                    return BadRequest(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "Repository ID mismatch",
                        }
                    );
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "Invalid repository data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                var existingRepository = await _context.Repositories.FindAsync(id);
                if (existingRepository == null)
                {
                    return NotFound(
                        new ApiResponse<Repository>
                        {
                            Success = false,
                            Message = "Repository not found",
                        }
                    );
                }

                // Check if user owns this repository or is admin
                var currentUserId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst("id")?.Value;
                if (
                    string.IsNullOrEmpty(currentUserId)
                    || !Guid.TryParse(currentUserId, out var userGuid)
                )
                {
                    return Unauthorized(
                        new ApiResponse<Repository>
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
                            "UpdateRepository - Found roles in claim type '{ClaimType}': {Roles}",
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
                    "UpdateRepository Permission Check - UserId: {UserId}, RepositoryOwner: {RepositoryOwner}, IsAdmin: {IsAdmin}",
                    userGuid,
                    existingRepository.UserId,
                    isAdmin
                );

                if (existingRepository.UserId != userGuid && !isAdmin)
                {
                    _logger.LogWarning(
                        "UpdateRepository Access Denied - User {UserId} cannot edit repository {RepositoryId} owned by {RepositoryOwner}",
                        userGuid,
                        existingRepository.Id,
                        existingRepository.UserId
                    );
                    return Forbid();
                }

                // Update properties
                existingRepository.Name = repository.Name;
                existingRepository.Description = repository.Description;
                existingRepository.Url = repository.Url;
                existingRepository.Provider = repository.Provider;
                existingRepository.Language = repository.Language;
                existingRepository.Stars = repository.Stars;
                existingRepository.Forks = repository.Forks;
                existingRepository.Issues = repository.Issues;
                existingRepository.LastCommitAt = repository.LastCommitAt;
                existingRepository.License = repository.License;
                existingRepository.Topics = repository.Topics;
                existingRepository.IsPrivate = repository.IsPrivate;
                existingRepository.IsFork = repository.IsFork;
                existingRepository.IsArchived = repository.IsArchived;
                existingRepository.Size = repository.Size;
                existingRepository.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<Repository>
                    {
                        Success = true,
                        Data = existingRepository,
                        Message = "Repository updated successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating repository with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<Repository>
                    {
                        Success = false,
                        Message = "An error occurred while updating the repository",
                    }
                );
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteRepository(Guid id)
        {
            try
            {
                var repository = await _context.Repositories.FindAsync(id);
                if (repository == null)
                {
                    return NotFound(
                        new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Repository not found",
                        }
                    );
                }

                // Check if user owns this repository or is admin
                var currentUserId =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst("id")?.Value;
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
                            "DeleteRepository - Found roles in claim type '{ClaimType}': {Roles}",
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
                    "DeleteRepository Permission Check - UserId: {UserId}, RepositoryOwner: {RepositoryOwner}, IsAdmin: {IsAdmin}",
                    userGuid,
                    repository.UserId,
                    isAdmin
                );

                if (repository.UserId != userGuid && !isAdmin)
                {
                    _logger.LogWarning(
                        "DeleteRepository Access Denied - User {UserId} cannot delete repository {RepositoryId} owned by {RepositoryOwner}",
                        userGuid,
                        repository.Id,
                        repository.UserId
                    );
                    return Forbid();
                }

                _context.Repositories.Remove(repository);
                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<object>
                    {
                        Success = true,
                        Message = "Repository deleted successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting repository with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<object>
                    {
                        Success = false,
                        Message = "An error occurred while deleting the repository",
                    }
                );
            }
        }
    }
}
