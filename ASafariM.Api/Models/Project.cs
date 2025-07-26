using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        
        // Foreign Keys
        [Required]
        public Guid UserId { get; set; }
        
        public Guid? TechStackId { get; set; }
        
        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey("TechStackId")]
        public virtual TechStack? TechStack { get; set; }
        
        public virtual ICollection<Repository> Repositories { get; set; } = new List<Repository>();
    }
}
