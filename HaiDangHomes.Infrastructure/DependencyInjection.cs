using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Resend;
using StackExchange.Redis;
using System.Net.Http;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.Services;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;
using HaiDangHomes.Infrastructure.Repositories;
using HaiDangHomes.Infrastructure.Services;

namespace HaiDangHomes.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database — clean connection string (remove unsupported params like channel_binding)
        var rawConnectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
        var connectionString = CleanConnectionString(rawConnectionString);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsAssembly("HaiDangHomes.API")));

        // Redis
        var redisConnectionString = configuration.GetConnectionString("Redis");
        services.AddSingleton<IConnectionMultiplexer>(sp =>
            ConnectionMultiplexer.Connect(redisConnectionString ?? "localhost"));
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString ?? "localhost";
            options.InstanceName = "HaiDangHomes:";
        });
        services.AddScoped<ICacheService, CacheService>();

        // Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IPropertyRepository, PropertyRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IAmenityRepository, AmenityRepository>();
        services.AddScoped<IRoomImageRepository, RoomImageRepository>();
        services.AddScoped<IRoomAmenityRepository, RoomAmenityRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IActivityLogRepository, ActivityLogRepository>();

        // Cloudinary file storage (replaces AWS S3)
        var cloudName = configuration["Cloudinary:CloudName"] ?? "";
        var cloudApiKey = configuration["Cloudinary:ApiKey"] ?? "";
        var cloudApiSecret = configuration["Cloudinary:ApiSecret"] ?? "";

        if (!string.IsNullOrEmpty(cloudName) && !string.IsNullOrEmpty(cloudApiKey) && !string.IsNullOrEmpty(cloudApiSecret))
        {
            services.AddScoped<IFileStorageService>(sp =>
                new CloudinaryFileStorageService(cloudName, cloudApiKey, cloudApiSecret));
        }
        else
        {
            // Fallback: local file storage (for development only)
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
        }

        // Resend Email
        services.AddScoped<IEmailService>(sp =>
        {
            var apiKey = configuration["Resend:ApiKey"] ?? "";
            var fromEmail = configuration["Resend:FromEmail"] ?? "noreply@haidanghomes.com";
            var companyName = configuration["App:CompanyName"] ?? "HaiDang Homes";
            var logger = sp.GetRequiredService<ILogger<ResendEmailService>>();
            return new ResendEmailService(apiKey, fromEmail, companyName, logger);
        });

        // QR Code
        services.AddScoped<IQrCodeService, QrCodeService>();

        // PayOS Payment Gateway
        services.AddHttpClient<PayOSPaymentService>();
        services.AddScoped<IPaymentGatewayService>(sp =>
        {
            var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
            var httpClient = httpClientFactory.CreateClient("PayOS");
            var logger = sp.GetRequiredService<ILogger<PayOSPaymentService>>();
            var unitOfWork = sp.GetRequiredService<IUnitOfWork>();

            return new PayOSPaymentService(
                configuration["PayOS:ClientId"] ?? "",
                configuration["PayOS:ApiKey"] ?? "",
                configuration["PayOS:ChecksumKey"] ?? "",
                configuration["PayOS:ReturnUrl"] ?? "",
                configuration["PayOS:CancelUrl"] ?? "",
                httpClient,
                logger,
                unitOfWork);
        });

        // JWT Settings
        var jwtSettings = new JwtSettings
        {
            Secret = configuration["Jwt:Secret"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32Characters!",
            Issuer = configuration["Jwt:Issuer"] ?? "HaiDangHomes",
            Audience = configuration["Jwt:Audience"] ?? "HaiDangHomesAPI",
            ExpiryInMinutes = int.Parse(configuration["Jwt:ExpiryInMinutes"] ?? "60"),
            RefreshTokenExpiryInDays = int.Parse(configuration["Jwt:RefreshTokenExpiryInDays"] ?? "7")
        };
        services.AddSingleton(jwtSettings);

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBookingService, BookingService>();

        return services;
    }

    /// <summary>
    /// Converts URL-format connection string (postgresql://user:pass@host/db?sslmode=require)
    /// to Npgsql key-value format (Host=...;Database=...;Username=...;Password=...;SSL Mode=Require).
    /// </summary>
    private static string CleanConnectionString(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString)) return connectionString;

        if (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(connectionString);
                var db = uri.AbsolutePath.TrimStart('/');
                var userInfo = uri.UserInfo.Split(':');
                var user = userInfo[0];
                var pass = userInfo.Length > 1 ? userInfo[1] : "";

                // Parse sslmode from query string
                var sslMode = "Require";
                if (uri.Query.Length > 1)
                {
                    var query = uri.Query.TrimStart('?');
                    foreach (var param in query.Split('&'))
                    {
                        if (param.StartsWith("sslmode=", StringComparison.OrdinalIgnoreCase))
                        {
                            var value = param.Substring("sslmode=".Length).ToLower();
                            sslMode = value switch
                            {
                                "require" => "Require",
                                "prefer" => "Prefer",
                                "disable" => "Disable",
                                _ => "Require"
                            };
                        }
                    }
                }

                return $"Host={uri.Host};Database={db};Username={user};Password={pass};SSL Mode={sslMode}";
            }
            catch
            {
                return connectionString;
            }
        }

        return connectionString;
    }
}
