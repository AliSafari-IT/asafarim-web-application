using System.Text;
using ASafariM.Api.Data;
using ASafariM.Api.Models;
using ASafariM.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Configure JWT Authentication
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "YourSecretKeyHere")
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReactApp",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173", "http://localhost:3000") // Vite and CRA default ports
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Create database if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        context.Database.EnsureCreated();
        
        // Seed tech stacks if none exist
        if (!context.TechStacks.Any())
        {
            logger.LogInformation("Seeding tech stacks...");
            
            var techStacks = new[]
            {
                new TechStack { Id = Guid.NewGuid(), Name = "React", Category = "Frontend", Description = "A JavaScript library for building user interfaces", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "TypeScript", Category = "Language", Description = "Typed superset of JavaScript", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "ASP.NET Core", Category = "Backend", Description = "Cross-platform web framework", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Entity Framework", Category = "Database", Description = "Object-relational mapping framework", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "SQL Server", Category = "Database", Description = "Relational database management system", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Node.js", Category = "Backend", Description = "JavaScript runtime environment", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Python", Category = "Language", Description = "High-level programming language", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Docker", Category = "DevOps", Description = "Containerization platform", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Git", Category = "DevOps", Description = "Version control system", IsActive = true, CreatedAt = DateTime.UtcNow },
                new TechStack { Id = Guid.NewGuid(), Name = "Redis", Category = "Database", Description = "In-memory data structure store", IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            
            context.TechStacks.AddRange(techStacks);
            context.SaveChanges();
            
            logger.LogInformation($"Seeded {techStacks.Length} tech stacks successfully.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while creating the database or seeding data.");
    }
}

app.Run();
