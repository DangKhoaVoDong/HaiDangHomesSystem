using System.Security.Cryptography;
using System.Text;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HaiDangHomes.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    private static readonly Guid HostAdminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid HostManagerId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid Customer1Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid Customer2Id = Guid.Parse("44444444-4444-4444-4444-444444444444");

    public static async Task SeedAsync(ApplicationDbContext dbContext, ILogger logger, bool forceReseed = false)
    {
        try
        {
            await dbContext.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "DatabaseSeeder: Migrate step skipped or failed (will rely on existing schema).");
        }

        var forceReseed = Environment.GetEnvironmentVariable("FORCE_RESET_DB")?.ToLower() == "true";

        var hasData = await dbContext.Users.IgnoreQueryFilters().AnyAsync();

        var now = DateTime.UtcNow;

        if (hasData && !forceReseed)
        {
            logger.LogInformation("DatabaseSeeder: Database already contains data — skipping seed.");

            // Ensure the two default brands exist (idempotent). Useful when migrating
            // an existing DB that has properties referencing HAIDANG HOMESTAYS / NOVA WORD
            // but no rows in the new Brands table yet.
            await EnsureDefaultBrandsAsync(dbContext, logger, now);
            return;
        }

        logger.LogInformation("DatabaseSeeder: Seeding initial data...");

        if (forceReseed)
        {
            logger.LogWarning("DatabaseSeeder: Force reseed requested — wiping existing rows.");
            await dbContext.RoomAmenities.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.RoomImages.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.RoomAvailabilities.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Rooms.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.PropertyAmenities.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.PropertyImages.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.PropertyTranslations.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Properties.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.CategoryTranslations.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Categories.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Brands.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.AmenityTranslations.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Amenities.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.RefreshTokens.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Bookings.IgnoreQueryFilters().ExecuteDeleteAsync();
            await dbContext.Users.IgnoreQueryFilters().ExecuteDeleteAsync();
        }

        // ---------------- USERS ----------------
        var users = new List<User>
        {
            new()
            {
                Id = HostAdminId,
                Email = "admin@haidanghomes.com",
                PhoneNumber = "0900000001",
                PasswordHash = HashPassword("Admin@123"),
                FullName = "Hai Dang Admin",
                Role = UserRole.Admin,
                IsVerified = true,
                IsDeleted = false,
                CreatedAt = now,
                CreatedBy = "system"
            },
            new()
            {
                Id = HostManagerId,
                Email = "manager@haidanghomes.com",
                PhoneNumber = "0900000002",
                PasswordHash = HashPassword("Manager@123"),
                FullName = "Nguyen Quan Ly",
                Role = UserRole.Manager,
                IsVerified = true,
                IsDeleted = false,
                CreatedAt = now,
                CreatedBy = "system"
            },
            new()
            {
                Id = Customer1Id,
                Email = "khach1@gmail.com",
                PhoneNumber = "0900000003",
                PasswordHash = HashPassword("Customer@123"),
                FullName = "Tran Van Khach",
                Role = UserRole.Customer,
                IsVerified = true,
                IsDeleted = false,
                LoyaltyPoints = 120,
                MembershipTier = MembershipTier.Silver,
                CreatedAt = now,
                CreatedBy = "system"
            },
            new()
            {
                Id = Customer2Id,
                Email = "khach2@gmail.com",
                PhoneNumber = "0900000004",
                PasswordHash = HashPassword("Customer@123"),
                FullName = "Le Thi Khach",
                Role = UserRole.Customer,
                IsVerified = true,
                IsDeleted = false,
                LoyaltyPoints = 60,
                MembershipTier = MembershipTier.Regular,
                CreatedAt = now,
                CreatedBy = "system"
            }
        };
        await dbContext.Users.AddRangeAsync(users);

        // ---------------- CATEGORIES ----------------
        var catHotel = Guid.NewGuid();
        var catHomestay = Guid.NewGuid();
        var catResort = Guid.NewGuid();
        var catApartment = Guid.NewGuid();

        var categories = new List<Category>
        {
            new() { Id = catHotel,    Name = "Khach san",  Description = "Co so luu tru chuyen nghiep voi day dich vu",          DisplayOrder = 1, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = catHomestay, Name = "Homestay",   Description = "Trai nghiem song nhu nguoi ban dia",                   DisplayOrder = 2, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = catResort,   Name = "Resort",     Description = "Khu nghi duong cao cap, nhieu tien ich",               DisplayOrder = 3, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = catApartment,Name = "Can ho",     Description = "Can ho cho thue day du noi that",                      DisplayOrder = 4, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" }
        };
        await dbContext.Categories.AddRangeAsync(categories);

        var categoryTranslations = new List<CategoryTranslation>
        {
            new() { Id = Guid.NewGuid(), CategoryId = catHotel,     Language = SupportedLanguage.En, Name = "Hotel",     Description = "Professional lodging with full services" },
            new() { Id = Guid.NewGuid(), CategoryId = catHomestay,  Language = SupportedLanguage.En, Name = "Homestay",  Description = "Live like a local" },
            new() { Id = Guid.NewGuid(), CategoryId = catResort,    Language = SupportedLanguage.En, Name = "Resort",    Description = "Premium resort with amenities" },
            new() { Id = Guid.NewGuid(), CategoryId = catApartment, Language = SupportedLanguage.En, Name = "Apartment", Description = "Fully furnished apartment for rent" },
            new() { Id = Guid.NewGuid(), CategoryId = catHotel,     Language = SupportedLanguage.Vi, Name = "Khách sạn",     Description = "Cơ sở lưu trú chuyên nghiệp với đầy đủ dịch vụ" },
            new() { Id = Guid.NewGuid(), CategoryId = catHomestay,  Language = SupportedLanguage.Vi, Name = "Homestay",      Description = "Trải nghiệm sống như người bản địa" },
            new() { Id = Guid.NewGuid(), CategoryId = catResort,    Language = SupportedLanguage.Vi, Name = "Resort",        Description = "Khu nghỉ dưỡng cao cấp, nhiều tiện ích" },
            new() { Id = Guid.NewGuid(), CategoryId = catApartment, Language = SupportedLanguage.Vi, Name = "Căn hộ",        Description = "Căn hộ cho thuê đầy đủ nội thất" }
        };
        await dbContext.CategoryTranslations.AddRangeAsync(categoryTranslations);

        // ---------------- BRANDS ----------------
        var existingBrandNames = await dbContext.Brands.IgnoreQueryFilters().Select(b => b.Name).ToListAsync();
        var newBrands = new List<Brand>();
        if (!existingBrandNames.Contains("HAIDANG HOMESTAYS"))
            newBrands.Add(new() { Id = Guid.NewGuid(), Name = "HAIDANG HOMESTAYS", Description = "Thuong hieu homestay truyen thong Viet Nam", IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" });
        if (!existingBrandNames.Contains("NOVA WORD"))
            newBrands.Add(new() { Id = Guid.NewGuid(), Name = "NOVA WORD", Description = "Thuong hieu can hoi hien dai", IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" });
        if (newBrands.Count > 0)
            await dbContext.Brands.AddRangeAsync(newBrands);

        // ---------------- AMENITIES ----------------
        var amenityWifi      = Guid.NewGuid();
        var amenityPool      = Guid.NewGuid();
        var amenityParking   = Guid.NewGuid();
        var amenityAc        = Guid.NewGuid();
        var amenityTv        = Guid.NewGuid();
        var amenityBreakfast = Guid.NewGuid();
        var amenityGym       = Guid.NewGuid();
        var amenityKitchen   = Guid.NewGuid();

        var amenities = new List<Amenity>
        {
            new() { Id = amenityWifi,      Name = "WiFi mien phi", Icon = "wifi",      DisplayOrder = 1, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityPool,      Name = "Ho boi",        Icon = "pool",      DisplayOrder = 2, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityParking,   Name = "Bai do xe",     Icon = "parking",   DisplayOrder = 3, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityAc,        Name = "Dieu hoa",      Icon = "ac",        DisplayOrder = 4, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityTv,        Name = "TV",            Icon = "tv",        DisplayOrder = 5, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityBreakfast, Name = "An sang",       Icon = "breakfast", DisplayOrder = 6, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityGym,       Name = "Phong gym",     Icon = "gym",       DisplayOrder = 7, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" },
            new() { Id = amenityKitchen,   Name = "Bep",           Icon = "kitchen",   DisplayOrder = 8, IsActive = true, IsDeleted = false, CreatedAt = now, CreatedBy = "system" }
        };
        await dbContext.Amenities.AddRangeAsync(amenities);

        var amenityTranslations = new List<AmenityTranslation>
        {
            new() { Id = Guid.NewGuid(), AmenityId = amenityWifi,      Language = SupportedLanguage.En, Name = "Free WiFi" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityPool,      Language = SupportedLanguage.En, Name = "Swimming Pool" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityParking,   Language = SupportedLanguage.En, Name = "Parking" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityAc,        Language = SupportedLanguage.En, Name = "Air Conditioner" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityTv,        Language = SupportedLanguage.En, Name = "TV" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityBreakfast, Language = SupportedLanguage.En, Name = "Breakfast" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityGym,       Language = SupportedLanguage.En, Name = "Gym" },
            new() { Id = Guid.NewGuid(), AmenityId = amenityKitchen,   Language = SupportedLanguage.En, Name = "Kitchen" }
        };
        await dbContext.AmenityTranslations.AddRangeAsync(amenityTranslations);

        // ---------------- PROPERTIES ----------------
        var propHoiAn     = Guid.NewGuid();
        var propPhuQuoc   = Guid.NewGuid();
        var propNhaTrang  = Guid.NewGuid();
        var propDaNang    = Guid.NewGuid();

        var properties = new List<Property>
        {
            new()
            {
                Id = propHoiAn, HostId = HostManagerId, CategoryId = catHomestay,
                Name = "Hai Dang Hoi An",
                Description = "Homestay phong cách cổ điển giữa lòng phố cổ Hội An, gần chợ đêm và sông Thu Bồn.",
                Address = "12 Nguyễn Thị Minh Khai", City = "Hoi An", District = "Quan Minh An",
                Latitude = 15.8801, Longitude = 108.3380,
                ThumbnailUrl = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=400&fit=crop",
                IsActive = true, IsFeatured = true, TotalRooms = 0,
                BrandName = "HAIDANG HOMESTAYS",
                IsDeleted = false, CreatedAt = now, CreatedBy = "system"
            },
            new()
            {
                Id = propPhuQuoc, HostId = HostManagerId, CategoryId = catResort,
                Name = "Hai Dang Phu Quoc Resort",
                Description = "Resort biển riêng tư với hồ bơi vô cực và bãi biển riêng tại Bãi Khem.",
                Address = "Bãi Khem, An Thới", City = "Phu Quoc", District = "Thành phố Phú Quốc",
                Latitude = 10.0326, Longitude = 104.0368,
                ThumbnailUrl = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=400&fit=crop",
                IsActive = true, IsFeatured = true, TotalRooms = 0,
                BrandName = "HAIDANG HOMESTAYS",
                IsDeleted = false, CreatedAt = now, CreatedBy = "system"
            },
            new()
            {
                Id = propNhaTrang, HostId = HostManagerId, CategoryId = catApartment,
                Name = "Hai Dang Nha Trang Apartment",
                Description = "Căn hộ view biển trung tâm thành phố, đầy đủ nội thất, phù hợp gia đình.",
                Address = "88 Trần Phú", City = "Nha Trang", District = "Lộc Thọ",
                Latitude = 12.2388, Longitude = 109.1967,
                ThumbnailUrl = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=400&fit=crop",
                IsActive = true, IsFeatured = false, TotalRooms = 0,
                BrandName = "NOVA WORD",
                IsDeleted = false, CreatedAt = now, CreatedBy = "system"
            },
            new()
            {
                Id = propDaNang, HostId = HostManagerId, CategoryId = catHotel,
                Name = "Hai Dang Da Nang Hotel",
                Description = "Khách sạn 4 sao sát biển Mỹ Khê, hồ bơi rooftop và nhà hàng Á - Âu.",
                Address = "23 Bạch Đằng", City = "Da Nang", District = "Quận Hải Châu",
                Latitude = 16.0544, Longitude = 108.2022,
                ThumbnailUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop",
                IsActive = true, IsFeatured = true, TotalRooms = 0,
                BrandName = "HAIDANG HOMESTAYS",
                IsDeleted = false, CreatedAt = now, CreatedBy = "system"
            }
        };
        await dbContext.Properties.AddRangeAsync(properties);

        var propertyTranslations = new List<PropertyTranslation>
        {
            new() { Id = Guid.NewGuid(), PropertyId = propHoiAn,    Language = SupportedLanguage.En, Name = "Hai Dang Hoi An",        Description = "Classic homestay in the heart of Hoi An ancient town." },
            new() { Id = Guid.NewGuid(), PropertyId = propPhuQuoc,  Language = SupportedLanguage.En, Name = "Hai Dang Phu Quoc",     Description = "Private beach resort with infinity pool at Bai Khem." },
            new() { Id = Guid.NewGuid(), PropertyId = propNhaTrang, Language = SupportedLanguage.En, Name = "Hai Dang Nha Trang",    Description = "Sea-view apartment in downtown Nha Trang." },
            new() { Id = Guid.NewGuid(), PropertyId = propDaNang,   Language = SupportedLanguage.En, Name = "Hai Dang Da Nang",      Description = "4-star beachfront hotel with rooftop pool." }
        };
        await dbContext.PropertyTranslations.AddRangeAsync(propertyTranslations);

        await dbContext.SaveChangesAsync();

        logger.LogInformation("DatabaseSeeder: Done. Users={Users}, Categories={Categories}, Amenities={Amenities}, Properties={Properties}, Translations={Translations}",
            users.Count, categories.Count, amenities.Count, properties.Count,
            categoryTranslations.Count + amenityTranslations.Count + propertyTranslations.Count);
    }

    private static async Task EnsureDefaultBrandsAsync(ApplicationDbContext dbContext, ILogger logger, DateTime now)
    {
        var defaults = new[] { "HAIDANG HOMESTAYS", "NOVA WORD" };
        var existing = await dbContext.Brands.IgnoreQueryFilters()
            .Where(b => defaults.Contains(b.Name))
            .Select(b => b.Name)
            .ToListAsync();

        var missing = defaults.Where(d => !existing.Contains(d)).ToList();
        if (missing.Count == 0) return;

        foreach (var name in missing)
        {
            dbContext.Brands.Add(new Brand
            {
                Id = Guid.NewGuid(),
                Name = name,
                Description = null,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = now,
                CreatedBy = "system"
            });
        }

        await dbContext.SaveChangesAsync();
        logger.LogInformation("DatabaseSeeder: Inserted missing default brands: {Brands}", string.Join(", ", missing));
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}