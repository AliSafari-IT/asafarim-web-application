using System.ComponentModel.DataAnnotations;

namespace ASafariM.Api.DTOs
{
    // User Registration DTOs
    public class UserRegistrationDto
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        public bool AcceptTerms { get; set; }
    }

    public class UserLoginDto
    {
        [Required]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; }
    }

    // User Response DTOs
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsEmailVerified { get; set; }
        public DateTime? EmailVerifiedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ProjectsCount { get; set; }
        public int RepositoriesCount { get; set; }
    }

    public class UpdateUserProfileDto
    {
        [EmailAddress]
        [StringLength(255)]
        public string? Email { get; set; }

        [StringLength(30)]
        public string? Role { get; set; }

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [StringLength(500)]
        public string? Bio { get; set; }

        [StringLength(255)]
        public string? Website { get; set; }

        [StringLength(100)]
        public string? Location { get; set; }

        [StringLength(255)]
        public string? Avatar { get; set; }

        public bool? IsActive { get; set; }
    }

    // User Preferences DTOs
    public class UserPreferencesDto
    {
        public Guid Id { get; set; }
        public string Theme { get; set; } = "light";
        public string Language { get; set; } = "en";
        public string Timezone { get; set; } = "UTC";
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public string ProjectVisibility { get; set; } = "public";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateUserPreferencesDto
    {
        [StringLength(20)]
        public string? Theme { get; set; }

        [StringLength(10)]
        public string? Language { get; set; }

        [StringLength(50)]
        public string? Timezone { get; set; }

        public bool? EmailNotifications { get; set; }

        public bool? PushNotifications { get; set; }

        [StringLength(20)]
        public string? ProjectVisibility { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(255, MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = new UserDto();
    }

    public class RefreshTokenDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
