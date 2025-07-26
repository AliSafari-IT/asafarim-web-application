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
            [FromQuery] bool? isFeatured = null)
        {
            try
            {
                var query = _context.Projects
                    .Include(p => p.User)
                    .Include(p => p.TechStack)
                    .AsQueryable();

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

                if (isPublic.HasValue)
                {
                    query = query.Where(p => p.IsPublic == isPublic.Value);
                }

                if (isFeatured.HasValue)
                {
                    query = query.Where(p => p.IsFeatured == isFeatured.Value);
                }

                query = query.Where(p => p.IsActive && !p.IsDeleted);

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
                    projects, page, totalPages, totalCount, pageSize, "Projects retrieved successfully.");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving projects");
                return StatusCode(500, ApiResponse<List<ProjectSummaryDto>>.ErrorResult(
                    "An error occurred while retrieving projects.", statusCode: 500));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProject(Guid id)
        {
            try
            {
                var project = await _context.Projects
                    .Include(p => p.User)
                    .Include(p => p.TechStack)
                    .Include(p => p.Repositories)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

                if (project == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResult("Project not found.", statusCode: 404));
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
                    TechStackId = project.TechStackId,
                    TechStackName = project.TechStack?.Name,
                    RepositoriesCount = project.Repositories.Count
                };

                return Ok(ApiResponse<ProjectDto>.SuccessResult(projectDto, "Project retrieved successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving project {ProjectId}", id);
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResult(
                    "An error occurred while retrieving the project.", statusCode: 500));
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> CreateProject([FromBody] CreateProjectDto createProjectDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(ApiResponse<ProjectDto>.ErrorResult("Validation failed.", errors, 400));
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<ProjectDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var project = new Project
                {
                    Title = createProjectDto.Title,
                    Description = createProjectDto.Description,
                    Status = createProjectDto.Status,
                    Priority = createProjectDto.Priority,
                    StartDate = createProjectDto.StartDate,
                    EndDate = createProjectDto.EndDate,
                    DueDate = createProjectDto.DueDate,
                    Budget = createProjectDto.Budget,
                    Tags = createProjectDto.Tags,
                    ThumbnailUrl = createProjectDto.ThumbnailUrl,
                    RepositoryUrl = createProjectDto.RepositoryUrl,
                    LiveUrl = createProjectDto.LiveUrl,
                    IsPublic = createProjectDto.IsPublic,
                    IsFeatured = createProjectDto.IsFeatured,
                    UserId = userGuid,
                    TechStackId = createProjectDto.TechStackId
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                // Load related data for response
                await _context.Entry(project)
                    .Reference(p => p.User)
                    .LoadAsync();

                if (project.TechStackId.HasValue)
                {
                    await _context.Entry(project)
                        .Reference(p => p.TechStack)
                        .LoadAsync();
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
                    TechStackId = project.TechStackId,
                    TechStackName = project.TechStack?.Name,
                    RepositoriesCount = 0
                };

                return Created($"api/projects/{project.Id}", 
                    ApiResponse<ProjectDto>.SuccessResult(projectDto, "Project created successfully.", 201));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating project");
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResult(
                    "An error occurred while creating the project.", statusCode: 500));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> UpdateProject(Guid id, [FromBody] UpdateProjectDto updateProjectDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                return BadRequest(ApiResponse<ProjectDto>.ErrorResult("Validation failed.", errors, 400));
            }

            try
            {
                var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                {
                    return Unauthorized(ApiResponse<ProjectDto>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var project = await _context.Projects
                    .Include(p => p.User)
                    .Include(p => p.TechStack)
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

                if (project == null)
                {
                    return NotFound(ApiResponse<ProjectDto>.ErrorResult("Project not found.", statusCode: 404));
                }

                if (project.UserId != userGuid)
                {
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
                    project.StartDate = updateProjectDto.StartDate;
                
                if (updateProjectDto.EndDate.HasValue)
                    project.EndDate = updateProjectDto.EndDate;
                
                if (updateProjectDto.DueDate.HasValue)
                    project.DueDate = updateProjectDto.DueDate;
                
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
                
                if (updateProjectDto.TechStackId.HasValue)
                    project.TechStackId = updateProjectDto.TechStackId;

                await _context.SaveChangesAsync();

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
                    TechStackId = project.TechStackId,
                    TechStackName = project.TechStack?.Name,
                    RepositoriesCount = await _context.Repositories.CountAsync(r => r.ProjectId == project.Id)
                };

                return Ok(ApiResponse<ProjectDto>.SuccessResult(projectDto, "Project updated successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating project {ProjectId}", id);
                return StatusCode(500, ApiResponse<ProjectDto>.ErrorResult(
                    "An error occurred while updating the project.", statusCode: 500));
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
                    return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token.", statusCode: 401));
                }

                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && !p.IsDeleted);

                if (project == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResult("Project not found.", statusCode: 404));
                }

                if (project.UserId != userGuid)
                {
                    return Forbid();
                }

                // Soft delete
                project.IsDeleted = true;
                project.DeletedAt = DateTime.UtcNow;
                project.DeletedBy = userGuid.ToString();

                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.SuccessResult(null, "Project deleted successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting project {ProjectId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "An error occurred while deleting the project.", statusCode: 500));
            }
        }
    }
}
