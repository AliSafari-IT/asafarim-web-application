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
    public class TechStacksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TechStacksController> _logger;

        public TechStacksController(
            ApplicationDbContext context,
            ILogger<TechStacksController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<TechStack>>>> GetTechStacks()
        {
            try
            {
                var techStacks = await _context
                    .TechStacks.Where(ts => ts.IsActive)
                    .OrderBy(ts => ts.Name)
                    .ToListAsync();

                return Ok(
                    new ApiResponse<IEnumerable<TechStack>>
                    {
                        Success = true,
                        Data = techStacks,
                        Message = "TechStacks retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tech stacks");
                return StatusCode(
                    500,
                    new ApiResponse<IEnumerable<TechStack>>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving tech stacks",
                    }
                );
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TechStack>>> GetTechStack(Guid id)
        {
            try
            {
                var techStack = await _context
                    .TechStacks.Include(ts => ts.Projects)
                    .FirstOrDefaultAsync(ts => ts.Id == id);

                if (techStack == null)
                {
                    return NotFound(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "TechStack not found",
                        }
                    );
                }

                return Ok(
                    new ApiResponse<TechStack>
                    {
                        Success = true,
                        Data = techStack,
                        Message = "TechStack retrieved successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tech stack with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<TechStack>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving the tech stack",
                    }
                );
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<TechStack>>> CreateTechStack(
            [FromBody] TechStack techStack
        )
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "Invalid tech stack data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                // Check if tech stack with same name already exists
                var existingTechStack = await _context.TechStacks.FirstOrDefaultAsync(ts =>
                    ts.Name.ToLower() == techStack.Name.ToLower()
                );

                if (existingTechStack != null)
                {
                    return Conflict(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "A tech stack with this name already exists",
                        }
                    );
                }

                techStack.Id = Guid.NewGuid();
                techStack.CreatedAt = DateTime.UtcNow;
                techStack.UpdatedAt = DateTime.UtcNow;

                _context.TechStacks.Add(techStack);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetTechStack),
                    new { id = techStack.Id },
                    new ApiResponse<TechStack>
                    {
                        Success = true,
                        Data = techStack,
                        Message = "TechStack created successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tech stack");
                return StatusCode(
                    500,
                    new ApiResponse<TechStack>
                    {
                        Success = false,
                        Message = "An error occurred while creating the tech stack",
                    }
                );
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TechStack>>> UpdateTechStack(
            Guid id,
            [FromBody] TechStack techStack
        )
        {
            try
            {
                if (id != techStack.Id)
                {
                    return BadRequest(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "TechStack ID mismatch",
                        }
                    );
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "Invalid tech stack data",
                            Errors = ModelState.ToDictionary(
                                kvp => kvp.Key,
                                kvp =>
                                    kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                                    ?? Array.Empty<string>()
                            ),
                        }
                    );
                }

                var existingTechStack = await _context.TechStacks.FindAsync(id);
                if (existingTechStack == null)
                {
                    return NotFound(
                        new ApiResponse<TechStack>
                        {
                            Success = false,
                            Message = "TechStack not found",
                        }
                    );
                }

                // Update properties
                existingTechStack.Name = techStack.Name;
                existingTechStack.Description = techStack.Description;
                existingTechStack.Category = techStack.Category;
                existingTechStack.TechVersion = techStack.TechVersion;
                existingTechStack.IconUrl = techStack.IconUrl;
                existingTechStack.DocumentationUrl = techStack.DocumentationUrl;
                existingTechStack.OfficialWebsite = techStack.OfficialWebsite;
                existingTechStack.Features = techStack.Features;
                existingTechStack.IsActive = techStack.IsActive;
                existingTechStack.PopularityRating = techStack.PopularityRating;
                existingTechStack.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<TechStack>
                    {
                        Success = true,
                        Data = existingTechStack,
                        Message = "TechStack updated successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tech stack with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<TechStack>
                    {
                        Success = false,
                        Message = "An error occurred while updating the tech stack",
                    }
                );
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteTechStack(Guid id)
        {
            try
            {
                var techStack = await _context.TechStacks.FindAsync(id);
                if (techStack == null)
                {
                    return NotFound(
                        new ApiResponse<object> { Success = false, Message = "TechStack not found" }
                    );
                }

                // Check if tech stack is being used by any projects
                var projectsUsingTechStack = await _context
                    .Projects.Where(p => p.TechStackId == id)
                    .CountAsync();

                if (projectsUsingTechStack > 0)
                {
                    return BadRequest(
                        new ApiResponse<object>
                        {
                            Success = false,
                            Message =
                                $"Cannot delete tech stack. It is being used by {projectsUsingTechStack} project(s)",
                        }
                    );
                }

                _context.TechStacks.Remove(techStack);
                await _context.SaveChangesAsync();

                return Ok(
                    new ApiResponse<object>
                    {
                        Success = true,
                        Message = "TechStack deleted successfully",
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tech stack with id {Id}", id);
                return StatusCode(
                    500,
                    new ApiResponse<object>
                    {
                        Success = false,
                        Message = "An error occurred while deleting the tech stack",
                    }
                );
            }
        }
    }
}
