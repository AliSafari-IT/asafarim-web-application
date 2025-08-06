using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ASafariM.Api.Models.Enums;

namespace ASafariM.Api.Models
{
    public class ProjectLink : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Label { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Type { get; set; }

        [StringLength(500)]
        public string? Url { get; set; }

        [StringLength(255)]
        public string? Icon { get; set; }

        [StringLength(20)]
        public string? Target { get; set; }

        [StringLength(100)]
        public string? ClassName { get; set; }

        [StringLength(1000)]
        public string? Style { get; set; } // JSON string for CSS properties

        // Foreign key to Project
        public Guid ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;
    }
}
