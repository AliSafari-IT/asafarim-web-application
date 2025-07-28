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
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(ApplicationDbContext context, ILogger<ProjectsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<ProjectSummaryDto>>> GetProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] bool? isPublic = null,
            [FromQuery] bool? isFeatured = null,
            [FromQuery] string? userId = null
        )
        {
            try
            {
                var query = _context
                    .Projects.Include(p => p.User)
                    .Include(p => p.ProjectTechStacks)
                    .ThenInclude(pts => pts.TechStack)
                    .AsQueryable();

                // Apply filters
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

                if (isPublic.HasValue)
                {
                    query = query.Where(p => p.IsPublic == isPublic.Value);
                }

                if (isFeatured.HasValue)
                {
                    query = query.Where(p => p.IsFeatured == isFeatured.Value);
                }

                if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid))
                {
                    _logger.LogInformation("Filtering projects by userId: {UserId}", userGuid);
                    query = query.Where(p => p.UserId == userGuid);

                    // Debug: Check how many projects match this user
                    var userProjectCount = await _context
                        .Projects.Where(p => p.UserId == userGuid && p.IsActive && !p.IsDeleted)
                        .CountAsync();
                    _logger.LogInformation(
                        "Found {Count} projects for user {UserId}",
                        userProjectCount,
                        userGuid
                    );
                }

                query = query.Where(p => p.IsActive && !p.IsDeleted);

                // Debug logging
                var allProjects = await _context
                    .Projects.Select(p => new
                    {
                        p.Id,
                        p.Title,
                        p.IsActive,
                        p.IsDeleted,
                        p.IsPublic,
                    })
                    .ToListAsync();
                _logger.LogInformation(
                    "Debug - All projects in database: {Projects}",
                    string.Join(
                        ", ",
                        allProjects.Select(p =>
                            $"{p.Title}(Active:{p.IsActive},Deleted:{p.IsDeleted},Public:{p.IsPublic})"
                        )
                    )
                );

                var filteredProjects = await query
                    .Select(p => new
                    {
                        p.Id,
                        p.Title,
                        p.IsPublic,
                    })
                    .ToListAsync();
                _logger.LogInformation(
                    "Debug - Filtered projects: {Projects}",
                    string.Join(
                        ", ",
                        filteredProjects.Select(p => $"{p.Title}(Public:{p.IsPublic})")
                    )
                );

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
                        UserUsername = p.User != null ? p.User.Username : string.Empty,
                        TechStackIds = p
                            .ProjectTechStacks.Select(pts => pts.TechStackId.ToString())
                            .ToList(),
                        TechStacks = new List<TechStackDto>(), // Temporarily simplified to fix SQL error
                    })
                    .ToListAsync();

                var response = PaginatedResponse<ProjectSummaryDto>.SuccessResult(
                    projects,
                    page,
                    totalPages,
                    totalCount,
                    pageSize,
                    "Projects retrieved successfully."
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving projects");
                return StatusCode(
                    500,
                    ApiResponse<List<ProjectSummaryDto>>.ErrorResult(
                        "An error occurred while retrieving projects.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<
            ActionResult<PaginatedResponse<ProjectSummaryDto>>
        > GetAllProjectsForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null
        )
        {
            try
            {
                _logger.LogInformation(
                    "Admin requesting all projects - User: {User}, Role: {Role}",
                    User.Identity?.Name,
                    User.FindFirst("role")?.Value
                );

                var query = _context
                    .Projects.Include(p => p.User)
                    .Include(p => p.ProjectTechStacks)
                    .ThenInclude(pts => pts.TechStack)
                    .Where(p => p.IsActive && !p.IsDeleted) // Only active, non-deleted projects
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p =>
                        p.Title.Contains(search)
                        || (p.Description != null && p.Description.Contains(search))
                        || p.User.Username.Contains(search)
                    );
                }

                // Apply status filter
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(p => p.Status == status);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                _logger.LogInformation("Admin query found {TotalCount} projects", totalCount);

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
                        UserUsername = p.User != null ? p.User.Username : string.Empty,
                        TechStackIds = p.ProjectTechStacks
                            .Select(pts => pts.TechStackId.ToString())
                            .ToList(),
                        TechStacks = new List<TechStackDto>(), // Temporarily simplified to fix SQL error
                    })
                    .ToListAsync();

                _logger.LogInformation("Returning {Count} projects for admin", projects.Count);

                var response = PaginatedResponse<ProjectSummaryDto>.SuccessResult(
                    projects,
                    page,
                    totalPages,
                    totalCount,
                    pageSize,
                    $"Admin: Retrieved {projects.Count} of {totalCount} projects successfully."
                );

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving projects for admin");
                return StatusCode(
                    500,
                    ApiResponse<List<ProjectSummaryDto>>.ErrorResult(
                        "An error occurred while retrieving projects for admin.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProject(Guid id)
        {
            try
            {
                var project = await _context
                    .Projects.Include(p => p.User)
                    .Include(p => p.ProjectTechStacks)
                    .ThenInclude(pts => pts.TechStack)
                    .Include(p => p.Repositories)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

                if (project == null)
                {
                    return NotFound(
                        ApiResponse<ProjectDto>.ErrorResult("Project not found.", statusCode: 404)
                    );
                }

                var projectDto = new ProjectDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    Status = project.Status,
                    Priority = project.Priority,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    DueDate = project.DueDate,
                    Budget = project.Budget,
                    Progress = project.Progress,
                    Tags = project.Tags,
                    ThumbnailUrl = project.ThumbnailUrl,
                    RepositoryUrl = project.RepositoryUrl,
                    LiveUrl = project.LiveUrl,
                    IsPublic = project.IsPublic,
                    IsFeatured = project.IsFeatured,
                    CreatedAt = project.CreatedAt,
                    UpdatedAt = project.UpdatedAt,
                    IsActive = project.IsActive,
                    UserId = project.UserId,
                    UserUsername = project.User.Username,
                    TechStackIds = project
                        .ProjectTechStacks.Select(pts => pts.TechStackId.ToString())
                        .ToList(),
                    TechStacks = project
                        .ProjectTechStacks.Select(pts => new TechStackDto
                        {
                            Id = pts.TechStack.Id,
                            Name = pts.TechStack.Name,
                            Category = pts.TechStack.Category,
                            Description = pts.TechStack.Description,
                            IsActive = pts.TechStack.IsActive,
                        })
                        .ToList(),
                    RepositoriesCount = project.Repositories.Count,
                };

                return Ok(
                    ApiResponse<ProjectDto>.SuccessResult(
                        projectDto,
                        "Project retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving project {ProjectId}", id);
                return StatusCode(
                    500,
                    ApiResponse<ProjectDto>.ErrorResult(
                        "An error occurred while retrieving the project.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> CreateProject(
            [FromBody] CreateProjectDto createProjectDto
        )
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp =>
                            kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                            ?? Array.Empty<string>()
                    );

                return BadRequest(
                    ApiResponse<ProjectDto>.ErrorResult("Validation failed.", errors, 400)
                );
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<ProjectDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var project = new Project
                {
                    Title = createProjectDto.Title,
                    Description = createProjectDto.Description,
                    Status = createProjectDto.Status,
                    Priority = createProjectDto.Priority,
                    StartDate = createProjectDto.StartDate?.ToUniversalTime(),
                    EndDate = createProjectDto.EndDate?.ToUniversalTime(),
                    DueDate = createProjectDto.DueDate?.ToUniversalTime(),
                    Budget = createProjectDto.Budget,
                    Tags = createProjectDto.Tags,
                    ThumbnailUrl = createProjectDto.ThumbnailUrl,
                    RepositoryUrl = createProjectDto.RepositoryUrl,
                    LiveUrl = createProjectDto.LiveUrl,
                    IsPublic = createProjectDto.IsPublic,
                    IsFeatured = createProjectDto.IsFeatured,
                    UserId = userGuid,
                    CreatedBy = userGuid.ToString(),
                    UpdatedBy = userGuid.ToString(),
                };

                // Log project details for debugging
                _logger.LogInformation(
                    "Creating project with UserId: {UserId}, Title: {Title}, TechStackId: {TechStackId}",
                    userGuid,
                    createProjectDto.Title,
                    createProjectDto.TechStackIds
                );

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                // Handle many-to-many tech stack relationships
                if (createProjectDto.TechStackIds != null && createProjectDto.TechStackIds.Any())
                {
                    foreach (var techStackIdString in createProjectDto.TechStackIds)
                    {
                        if (Guid.TryParse(techStackIdString, out var techStackId))
                        {
                            var projectTechStack = new ProjectTechStack
                            {
                                ProjectId = project.Id,
                                TechStackId = techStackId,
                            };
                            _context.ProjectTechStacks.Add(projectTechStack);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                // Load related data for response
                await _context.Entry(project).Reference(p => p.User).LoadAsync();
                await _context
                    .Entry(project)
                    .Collection(p => p.ProjectTechStacks)
                    .Query()
                    .Include(pts => pts.TechStack)
                    .LoadAsync();

                var projectDto = new ProjectDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    Status = project.Status,
                    Priority = project.Priority,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    DueDate = project.DueDate,
                    Budget = project.Budget,
                    Progress = project.Progress,
                    Tags = project.Tags,
                    ThumbnailUrl = project.ThumbnailUrl,
                    RepositoryUrl = project.RepositoryUrl,
                    LiveUrl = project.LiveUrl,
                    IsPublic = project.IsPublic,
                    IsFeatured = project.IsFeatured,
                    CreatedAt = project.CreatedAt,
                    UpdatedAt = project.UpdatedAt,
                    IsActive = project.IsActive,
                    UserId = project.UserId,
                    UserUsername = project.User.Username,
                    TechStackIds = project
                        .ProjectTechStacks.Select(pts => pts.TechStackId.ToString())
                        .ToList(),
                    TechStacks = project
                        .ProjectTechStacks.Select(pts => new TechStackDto
                        {
                            Id = pts.TechStack.Id,
                            Name = pts.TechStack.Name,
                            Category = pts.TechStack.Category,
                            Description = pts.TechStack.Description,
                            IsActive = pts.TechStack.IsActive,
                        })
                        .ToList(),
                    RepositoriesCount = 0,
                };

                return Created(
                    $"api/projects/{project.Id}",
                    ApiResponse<ProjectDto>.SuccessResult(
                        projectDto,
                        "Project created successfully.",
                        201
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error occurred while creating project. Details: {ErrorMessage}. StackTrace: {StackTrace}",
                    ex.Message,
                    ex.StackTrace
                );

                // Return more detailed error for debugging
                var errorMessage = $"An error occurred while creating the project: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $" Inner exception: {ex.InnerException.Message}";
                }

                return StatusCode(
                    500,
                    ApiResponse<ProjectDto>.ErrorResult(errorMessage, statusCode: 500)
                );
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> UpdateProject(
            Guid id,
            [FromBody] UpdateProjectDto updateProjectDto
        )
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp =>
                            kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                            ?? Array.Empty<string>()
                    );

                return BadRequest(
                    ApiResponse<ProjectDto>.ErrorResult("Validation failed.", errors, 400)
                );
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<ProjectDto>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var project = await _context
                    .Projects.Include(p => p.User)
                    .Include(p => p.ProjectTechStacks)
                    .ThenInclude(pts => pts.TechStack)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

                if (project == null)
                {
                    return NotFound(
                        ApiResponse<ProjectDto>.ErrorResult("Project not found.", statusCode: 404)
                    );
                }

                // Check if user owns the project OR is an admin
                // Debug: Log all available claims
                _logger.LogInformation("=== ALL JWT CLAIMS DEBUG ===");
                if (User?.Claims != null)
                {
                    foreach (var claim in User.Claims)
                    {
                        _logger.LogInformation(
                            "Claim Type: {Type}, Value: {Value}",
                            claim.Type,
                            claim.Value
                        );
                    }
                }
                _logger.LogInformation("=== END CLAIMS DEBUG ===");

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
                            "Found roles in claim type '{ClaimType}': {Roles}",
                            claimType,
                            string.Join(", ", claims)
                        );
                        roleClaims.AddRange(claims);
                    }
                }

                var userRole = roleClaims.FirstOrDefault();
                var isAdmin =
                    roleClaims.Contains("Admin")
                    || roleClaims.Contains("SuperAdmin")
                    || roleClaims.Contains("admin")
                    || roleClaims.Contains("superadmin");

                _logger.LogInformation("Role Claims Found: {Roles}", string.Join(", ", roleClaims));
                _logger.LogInformation(
                    "UpdateProject Permission Check - UserId: {UserId}, ProjectOwner: {ProjectOwner}, UserRole: {UserRole}, IsAdmin: {IsAdmin}",
                    userGuid,
                    project.UserId,
                    userRole,
                    isAdmin
                );

                if (project.UserId != userGuid && !isAdmin)
                {
                    _logger.LogWarning(
                        "UpdateProject Access Denied - User {UserId} with role {UserRole} cannot edit project {ProjectId} owned by {ProjectOwner}",
                        userGuid,
                        userRole,
                        project.Id,
                        project.UserId
                    );
                    return Forbid();
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(updateProjectDto.Title))
                    project.Title = updateProjectDto.Title;

                if (updateProjectDto.Description != null)
                    project.Description = updateProjectDto.Description;

                if (!string.IsNullOrEmpty(updateProjectDto.Status))
                    project.Status = updateProjectDto.Status;

                if (!string.IsNullOrEmpty(updateProjectDto.Priority))
                    project.Priority = updateProjectDto.Priority;

                if (updateProjectDto.StartDate.HasValue)
                    project.StartDate = updateProjectDto.StartDate?.ToUniversalTime();

                if (updateProjectDto.EndDate.HasValue)
                    project.EndDate = updateProjectDto.EndDate?.ToUniversalTime();

                if (updateProjectDto.DueDate.HasValue)
                    project.DueDate = updateProjectDto.DueDate?.ToUniversalTime();

                if (updateProjectDto.Budget.HasValue)
                    project.Budget = updateProjectDto.Budget;

                if (updateProjectDto.Progress.HasValue)
                    project.Progress = updateProjectDto.Progress.Value;

                if (updateProjectDto.Tags != null)
                    project.Tags = updateProjectDto.Tags;

                if (updateProjectDto.ThumbnailUrl != null)
                    project.ThumbnailUrl = updateProjectDto.ThumbnailUrl;

                if (updateProjectDto.RepositoryUrl != null)
                    project.RepositoryUrl = updateProjectDto.RepositoryUrl;

                if (updateProjectDto.LiveUrl != null)
                    project.LiveUrl = updateProjectDto.LiveUrl;

                if (updateProjectDto.IsPublic.HasValue)
                    project.IsPublic = updateProjectDto.IsPublic.Value;

                if (updateProjectDto.IsFeatured.HasValue)
                    project.IsFeatured = updateProjectDto.IsFeatured.Value;

                // Handle many-to-many tech stack updates
                if (updateProjectDto.TechStackIds != null)
                {
                    // Remove existing tech stack relationships
                    var existingProjectTechStacks = await _context
                        .ProjectTechStacks.Where(pts => pts.ProjectId == project.Id)
                        .ToListAsync();
                    _context.ProjectTechStacks.RemoveRange(existingProjectTechStacks);

                    // Add new tech stack relationships
                    foreach (var techStackIdString in updateProjectDto.TechStackIds)
                    {
                        if (Guid.TryParse(techStackIdString, out var techStackId))
                        {
                            var projectTechStack = new ProjectTechStack
                            {
                                ProjectId = project.Id,
                                TechStackId = techStackId,
                            };
                            _context.ProjectTechStacks.Add(projectTechStack);
                        }
                    }
                }

                // Set UpdatedBy field
                project.UpdatedBy = userGuid.ToString();
                project.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Load related data for response
                await _context
                    .Entry(project)
                    .Collection(p => p.ProjectTechStacks)
                    .Query()
                    .Include(pts => pts.TechStack)
                    .LoadAsync();

                var projectDto = new ProjectDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    Status = project.Status,
                    Priority = project.Priority,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    DueDate = project.DueDate,
                    Budget = project.Budget,
                    Progress = project.Progress,
                    Tags = project.Tags,
                    ThumbnailUrl = project.ThumbnailUrl,
                    RepositoryUrl = project.RepositoryUrl,
                    LiveUrl = project.LiveUrl,
                    IsPublic = project.IsPublic,
                    IsFeatured = project.IsFeatured,
                    CreatedAt = project.CreatedAt,
                    UpdatedAt = project.UpdatedAt,
                    IsActive = project.IsActive,
                    UserId = project.UserId,
                    UserUsername = project.User.Username,
                    TechStackIds = project
                        .ProjectTechStacks.Select(pts => pts.TechStackId.ToString())
                        .ToList(),
                    TechStacks = project
                        .ProjectTechStacks.Select(pts => new TechStackDto
                        {
                            Id = pts.TechStack.Id,
                            Name = pts.TechStack.Name,
                            Category = pts.TechStack.Category,
                            Description = pts.TechStack.Description,
                            IsActive = pts.TechStack.IsActive,
                        })
                        .ToList(),
                    RepositoriesCount = await _context.Repositories.CountAsync(r =>
                        r.ProjectId == project.Id
                    ),
                };

                return Ok(
                    ApiResponse<ProjectDto>.SuccessResult(
                        projectDto,
                        "Project updated successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating project {ProjectId}", id);
                return StatusCode(
                    500,
                    ApiResponse<ProjectDto>.ErrorResult(
                        "An error occurred while updating the project.",
                        statusCode: 500
                    )
                );
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteProject(Guid id)
        {
            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(
                        ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401)
                    );
                }

                var project = await _context.Projects.FirstOrDefaultAsync(p =>
                    p.Id == id && p.IsActive && !p.IsDeleted
                );

                if (project == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResult("Project not found.", statusCode: 404)
                    );
                }

                // Check if user owns the project OR is an admin
                // Debug: Log all available claims
                _logger.LogInformation("=== DELETE PROJECT - ALL JWT CLAIMS DEBUG ===");
                if (User?.Claims != null)
                {
                    foreach (var claim in User.Claims)
                    {
                        _logger.LogInformation(
                            "Claim Type: {Type}, Value: {Value}",
                            claim.Type,
                            claim.Value
                        );
                    }
                }
                _logger.LogInformation("=== END DELETE CLAIMS DEBUG ===");

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
                            "Found roles in claim type '{ClaimType}': {Roles}",
                            claimType,
                            string.Join(", ", claims)
                        );
                        roleClaims.AddRange(claims);
                    }
                }

                var userRole = roleClaims.FirstOrDefault();
                var isAdmin =
                    roleClaims.Contains("Admin")
                    || roleClaims.Contains("SuperAdmin")
                    || roleClaims.Contains("admin")
                    || roleClaims.Contains("superadmin");

                _logger.LogInformation("Role Claims Found: {Roles}", string.Join(", ", roleClaims));
                _logger.LogInformation(
                    "DeleteProject Permission Check - UserId: {UserId}, ProjectOwner: {ProjectOwner}, UserRole: {UserRole}, IsAdmin: {IsAdmin}",
                    userGuid,
                    project.UserId,
                    userRole,
                    isAdmin
                );

                if (project.UserId != userGuid && !isAdmin)
                {
                    _logger.LogWarning(
                        "DeleteProject Access Denied - User {UserId} with role {UserRole} cannot delete project {ProjectId} owned by {ProjectOwner}",
                        userGuid,
                        userRole,
                        project.Id,
                        project.UserId
                    );
                    return Forbid();
                }

                // Soft delete
                project.IsDeleted = true;
                project.DeletedAt = DateTime.UtcNow;
                project.DeletedBy = userGuid.ToString();

                await _context.SaveChangesAsync();

                return Ok(
                    ApiResponse<object>.SuccessResult(new { }, "Project deleted successfully.")
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting project {ProjectId}", id);
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResult(
                        "An error occurred while deleting the project.",
                        statusCode: 500
                    )
                );
            }
        }
    }
}
