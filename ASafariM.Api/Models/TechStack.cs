using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class TechStack : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string TechVersion { get; set; } = string.Empty;

        [StringLength(255)]
        public string? IconUrl { get; set; }

        [StringLength(255)]
        public string? DocumentationUrl { get; set; }

        [StringLength(255)]
        public string? OfficialWebsite { get; set; }

        public List<string> Features { get; set; } = new List<string>();

        public new bool IsActive { get; set; } = true;

        [Range(1, 5)]
        public int PopularityRating { get; set; } = 3;

        // Additional properties for frontend compatibility
        [StringLength(50)]
        public string? Color { get; set; } = "#666666";

        [StringLength(255)]
        public string? Icon { get; set; } // Alternative icon property

        // Navigation properties
        // Many-to-many relationship with Projects
        public virtual ICollection<ProjectTechStack> ProjectTechStacks { get; set; } =
            new List<ProjectTechStack>();

        // Helper property to get Projects directly
        [NotMapped]
        public virtual ICollection<Project> Projects =>
            ProjectTechStacks.Select(pts => pts.Project).ToList();
    }
}
