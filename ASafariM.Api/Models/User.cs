using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class User : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [StringLength(255)]
        public string? Avatar { get; set; }

        [StringLength(500)]
        public string? Bio { get; set; }

        [StringLength(255)]
        public string? Website { get; set; }

        [StringLength(100)]
        public string? Location { get; set; }

        [StringLength(50)]
        public string Role { get; set; } = "User";

        public bool IsEmailVerified { get; set; } = false;

        public DateTime? EmailVerifiedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        // Navigation properties
        public virtual UserPreferences? Preferences { get; set; }
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<Repository> Repositories { get; set; } = new List<Repository>();
    }
}
