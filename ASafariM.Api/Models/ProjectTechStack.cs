using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class ProjectTechStack : BaseEntity
    {
        [Required]
        public Guid ProjectId { get; set; }

        [Required]
        public Guid TechStackId { get; set; }

        // Navigation properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("TechStackId")]
        public virtual TechStack TechStack { get; set; } = null!;
    }
}
