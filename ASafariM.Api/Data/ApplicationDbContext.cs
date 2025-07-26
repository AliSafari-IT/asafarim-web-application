using Microsoft.EntityFrameworkCore;
using ASafariM.Api.Models;
using System.Text.Json;

namespace ASafariM.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserPreferences> UserPreferences { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<TechStack> TechStacks { get; set; }
        public DbSet<Repository> Repositories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure JSON conversion for List<string> properties
            modelBuilder.Entity<Project>()
                .Property(e => e.Tags)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );

            modelBuilder.Entity<TechStack>()
                .Property(e => e.Features)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );

            modelBuilder.Entity<Repository>()
                .Property(e => e.Topics)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );

            // Configure relationships
            modelBuilder.Entity<Project>()
                .HasOne(p => p.User)
                .WithMany(u => u.Projects)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.TechStack)
                .WithMany(t => t.Projects)
                .HasForeignKey(p => p.TechStackId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Repository>()
                .HasOne(r => r.User)
                .WithMany(u => u.Repositories)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Repository>()
                .HasOne(r => r.Project)
                .WithMany(p => p.Repositories)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure UserPreferences relationship
            modelBuilder.Entity<UserPreferences>()
                .HasOne(up => up.User)
                .WithOne(u => u.Preferences)
                .HasForeignKey<UserPreferences>(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Project>()
                .HasIndex(p => p.Title);

            modelBuilder.Entity<Repository>()
                .HasIndex(r => r.Name);

            modelBuilder.Entity<TechStack>()
                .HasIndex(t => t.Name);
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();
            
            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                }
            }
        }
    }
}
