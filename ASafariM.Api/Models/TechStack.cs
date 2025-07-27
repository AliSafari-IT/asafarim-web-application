using System.ComponentModel.DataAnnotations;

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

        public bool IsActive { get; set; } = true;

        [Range(1, 5)]
        public int PopularityRating { get; set; } = 3;

        // Navigation properties
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
