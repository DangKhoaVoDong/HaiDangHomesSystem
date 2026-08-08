using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using HaiDangHomes.Application;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.Services;
using HaiDangHomes.Infrastructure;
using HaiDangHomes.Infrastructure.Persistence;
using MediatR;
using StackExchange.Redis;
using HaiDangHomes.API.Infrastructure;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Console logging works consistently in local development, containers and
// restricted Windows accounts without requiring Event Log permissions.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add Infrastructure services (registers ApplicationDbContext, IConnectionMultiplexer, repositories, etc.)
builder.Services.AddInfrastructure(builder.Configuration);

// Add Application services (registers MediatR, FluentValidation)
builder.Services.AddApplication();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
    options.AddPolicy("booking", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) ||
    jwtSecret.Length < 32 ||
    jwtSecret.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "Jwt:Secret must be provided through configuration and contain at least 32 characters.");
}

var jwtSettings = new JwtSettings
{
    Secret = jwtSecret,
    Issuer = builder.Configuration["Jwt:Issuer"] ?? "HaiDangHomes",
    Audience = builder.Configuration["Jwt:Audience"] ?? "HaiDangHomesAPI",
    ExpiryInMinutes = int.Parse(builder.Configuration["Jwt:ExpiryInMinutes"] ?? "60"),
    RefreshTokenExpiryInDays = int.Parse(builder.Configuration["Jwt:RefreshTokenExpiryInDays"] ?? "7")
};
builder.Services.AddSingleton(jwtSettings);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Manager", policy => policy.RequireRole("Manager", "Admin"));
    options.AddPolicy("Customer", policy => policy.RequireRole("Customer", "Manager", "Admin"));
});

// Controllers
// Serialize enums as strings (e.g. "Admin" instead of 3) so the frontend
// can read user.role / booking.status / membershipTier as readable values.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HaiDang Homes API",
        Version = "v1",
        Description = "API for HaiDang Homes - Room Booking System"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS — allow frontend origins
var allowedOriginsEnv = Environment.GetEnvironmentVariable("AllowedOrigins");
var allowedOrigins = !string.IsNullOrEmpty(allowedOriginsEnv)
    ? allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    : builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
      ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition");
    });
});

// Health Checks — convert URL format to Npgsql key-value format
var healthCheckConn = ConnectionStringConverter.Convert(
    builder.Configuration.GetConnectionString("DefaultConnection") ?? "");

builder.Services.AddHealthChecks()
    .AddNpgSql(healthCheckConn, name: "postgresql");

var app = builder.Build();
app.UseExceptionHandler();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HaiDang Homes API v1");
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Apply migrations + seed initial data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        dbContext.Database.Migrate();
        var forceReseed = args.Any(a => a.Equals("--reseed", StringComparison.OrdinalIgnoreCase));
        await DatabaseSeeder.SeedAsync(dbContext, logger, forceReseed);
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Database migration or seeding failed; application startup aborted");
        throw;
    }
}

app.Run();

// Make Program accessible for testing
public partial class Program { }

/// <summary>
/// Converts URL-format connection string to Npgsql key-value format.
/// </summary>
public static class ConnectionStringConverter
{
    public static string Convert(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString)) return connectionString;

        if (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString)
                {
                    SslMode = Npgsql.SslMode.Require
                };
                return builder.ConnectionString;
            }
            catch
            {
                return connectionString;
            }
        }

        return connectionString;
    }
}
