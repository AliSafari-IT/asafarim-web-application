using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class RelatedProject : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(255)]
        public string? ImageUrl { get; set; }

        [StringLength(255)]
        public string? ImageAlt { get; set; }

        public int? ImageWidth { get; set; }

        public int? ImageHeight { get; set; }

        // Repository link
        [StringLength(500)]
        public string? RepoUrl { get; set; }

        [StringLength(100)]
        public string? RepoLabel { get; set; }

        // Demo link
        [StringLength(500)]
        public string? DemoUrl { get; set; }

        [StringLength(100)]
        public string? DemoLabel { get; set; }

        // Foreign key to Project
        public Guid ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;
    }
}
