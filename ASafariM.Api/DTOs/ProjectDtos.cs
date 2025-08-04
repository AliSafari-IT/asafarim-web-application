using System.ComponentModel.DataAnnotations;

namespace ASafariM.Api.DTOs
{
    // Project DTOs
    public class CreateProjectDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string Status { get; set; } = "Planning";

        [StringLength(50)]
        public string Priority { get; set; } = "Medium";

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? DueDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Budget { get; set; }

        public List<string> Tags { get; set; } = new List<string>();

        [StringLength(255)]
        public string? ThumbnailUrl { get; set; }

        [StringLength(255)]
        public string? RepositoryUrl { get; set; }

        [StringLength(255)]
        public string? LiveUrl { get; set; }

        public bool IsPublic { get; set; } = true;
        public bool IsFeatured { get; set; } = false;

        public List<string> TechStackIds { get; set; } = new List<string>();
    }

    public class UpdateProjectDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(100)]
        public string? Status { get; set; }

        [StringLength(50)]
        public string? Priority { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? DueDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Budget { get; set; }

        [Range(0, 100)]
        public int? Progress { get; set; }

        public List<string>? Tags { get; set; }

        [StringLength(255)]
        public string? ThumbnailUrl { get; set; }

        [StringLength(255)]
        public string? RepositoryUrl { get; set; }

        [StringLength(255)]
        public string? LiveUrl { get; set; }

        public bool? IsPublic { get; set; }
        public bool? IsFeatured { get; set; }

        public List<string> TechStackIds { get; set; } = new List<string>();
    }

    public class ProjectDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal? Budget { get; set; }
        public int Progress { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public string? ThumbnailUrl { get; set; }
        public string? RepositoryUrl { get; set; }
        public string? LiveUrl { get; set; }
        public bool IsPublic { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }

        // Related data
        public Guid UserId { get; set; }
        public string UserUsername { get; set; } = string.Empty;
        public List<string> TechStackIds { get; set; } = new List<string>();
        public List<TechStackDto>? TechStacks { get; set; }
        public int RepositoriesCount { get; set; }
    }

    public class ProjectSummaryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int Progress { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public string? ThumbnailUrl { get; set; }
        public bool IsPublic { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UserUsername { get; set; } = string.Empty;
        public decimal? Budget { get; set; }

        public List<string> TechStackIds { get; set; } = new List<string>();
        public List<TechStackDto>? TechStacks { get; set; }
    }

    // Repository DTOs
    public class CreateRepositoryDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [StringLength(255)]
        public string Url { get; set; } = string.Empty;

        [StringLength(50)]
        public string Provider { get; set; } = "GitHub";

        [StringLength(100)]
        public string? Language { get; set; }

        [StringLength(100)]
        public string? License { get; set; }

        public List<string> Topics { get; set; } = new List<string>();
        public bool IsPrivate { get; set; } = false;
        public Guid? ProjectId { get; set; }
    }

    public class RepositoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string? Language { get; set; }
        public int Stars { get; set; }
        public int Forks { get; set; }
        public int Issues { get; set; }
        public DateTime? LastCommitAt { get; set; }
        public string? License { get; set; }
        public List<string> Topics { get; set; } = new List<string>();
        public bool IsPrivate { get; set; }
        public bool IsFork { get; set; }
        public bool IsArchived { get; set; }
        public decimal? Size { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Related data
        public Guid UserId { get; set; }
        public string UserUsername { get; set; } = string.Empty;
        public Guid? ProjectId { get; set; }
        public string? ProjectTitle { get; set; }
    }

    // TechStack DTOs
    public class TechStackDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string TechVersion { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public string? DocumentationUrl { get; set; }
        public string? OfficialWebsite { get; set; }
        public List<string> Features { get; set; } = new List<string>();
        public bool IsActive { get; set; }
        public int PopularityRating { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ProjectsCount { get; set; }
    }
}
