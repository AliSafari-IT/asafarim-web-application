using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASafariM.Api.Models
{
    public class UserPreferences : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [StringLength(20)]
        public string Theme { get; set; } = "light"; // 'light', 'dark', 'auto'
        
        [StringLength(10)]
        public string Language { get; set; } = "en"; // Language code (en, es, fr, etc.)
        
        [StringLength(50)]
        public string Timezone { get; set; } = "UTC"; // Timezone identifier
        
        public bool EmailNotifications { get; set; } = true;
        
        public bool PushNotifications { get; set; } = true;
        
        [StringLength(20)]
        public string ProjectVisibility { get; set; } = "public"; // 'public', 'private', 'unlisted'
        
        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
