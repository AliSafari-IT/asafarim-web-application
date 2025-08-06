using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ASafariM.Api.Models.Enums;

namespace ASafariM.Api.Models
{
    public class Project : BaseEntity
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

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Budget { get; set; }

        [StringLength(10)]
        public string? BudgetCurrency { get; set; } = "USD";

        [StringLength(5)]
        public string? BudgetCurrencySymbol { get; set; } = "$";

        [Range(0, 100)]
        public int Progress { get; set; } = 0;

        public List<string> Tags { get; set; } = new List<string>();

        [StringLength(255)]
        public string? ThumbnailUrl { get; set; }

        [StringLength(255)]
        public string? RepositoryUrl { get; set; }

        [StringLength(255)]
        public string? LiveUrl { get; set; }

        public bool IsPublic { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        [StringLength(50)]
        public string? Category { get; set; }

        // Image properties
        [StringLength(255)]
        public string? ImageUrl { get; set; }

        [StringLength(255)]
        public string? ImageAlt { get; set; }

        public int? ImageWidth { get; set; }

        public int? ImageHeight { get; set; }

        // Budget details
        public int? BudgetRoundingIncrement { get; set; }

        [StringLength(50)]
        public string? BudgetCurrencyFormatOptions { get; set; }

        // Links and related data
        public List<ProjectLink> Links { get; set; } = new List<ProjectLink>();

        public List<RelatedProject> RelatedProjects { get; set; } = new List<RelatedProject>();

        // Tags relationship - for clickable tags with navigation
        public virtual ICollection<ProjectTag> ProjectTags { get; set; } = new List<ProjectTag>();

        // Foreign Keys
        [Required]
        public Guid UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Repository> Repositories { get; set; } = new List<Repository>();

        // Many-to-many relationship with TechStacks
        public virtual ICollection<ProjectTechStack> ProjectTechStacks { get; set; } =
            new List<ProjectTechStack>();

        // Helper property to get TechStacks directly
        [NotMapped]
        public virtual ICollection<TechStack> TechStacks =>
            ProjectTechStacks.Select(pts => pts.TechStack).ToList();
    }
}
