using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class Repository : BaseEntity
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

        public int Stars { get; set; } = 0;

        public int Forks { get; set; } = 0;

        public int Issues { get; set; } = 0;

        public DateTime? LastCommitAt { get; set; }

        [StringLength(100)]
        public string? License { get; set; }

        public List<string> Topics { get; set; } = new List<string>();

        public bool IsPrivate { get; set; } = false;

        public bool IsFork { get; set; } = false;

        public bool IsArchived { get; set; } = false;

        [Column(TypeName = "decimal(10,1)")]
        public decimal? Size { get; set; } // Size in MB

        // Foreign Keys
        [Required]
        public Guid UserId { get; set; }

        public Guid? ProjectId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }
    }
}
