using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<RoomAvailability> RoomAvailabilities => Set<RoomAvailability>();
    public DbSet<RoomImage> RoomImages => Set<RoomImage>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<RoomAmenity> RoomAmenities => Set<RoomAmenity>();
    public DbSet<PropertyAmenity> PropertyAmenities => Set<PropertyAmenity>();
    public DbSet<CategoryTranslation> CategoryTranslations => Set<CategoryTranslation>();
    public DbSet<RoomTranslation> RoomTranslations => Set<RoomTranslation>();
    public DbSet<AmenityTranslation> AmenityTranslations => Set<AmenityTranslation>();
    public DbSet<PropertyTranslation> PropertyTranslations => Set<PropertyTranslation>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.PhoneNumber);
            entity.HasIndex(e => e.VerificationCode);
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.VerificationCode).HasMaxLength(6);
            
            entity.HasMany(e => e.RefreshTokens)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            
            entity.Property(e => e.Token).IsRequired();
        });

        // Property configuration
        modelBuilder.Entity<Property>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.HostId);
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.BrandName);
            entity.HasIndex(e => e.City);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.Property(e => e.BrandName).HasMaxLength(64);
            
            entity.HasOne(e => e.Host)
                .WithMany()
                .HasForeignKey(e => e.HostId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Properties)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        });

        // Brand configuration
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();

            entity.Property(e => e.Name).IsRequired().HasMaxLength(64);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // Room configuration
        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PropertyId);
            entity.HasIndex(e => new { e.PropertyId, e.RoomNumber }).IsUnique();
            
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
            entity.Property(e => e.PricePerNight).HasPrecision(18, 2);
            
            entity.HasOne(e => e.Property)
                .WithMany(p => p.Rooms)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Amenity configuration
        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name);
            
            entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BookingCode).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.RoomId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.RoomId, e.CheckInDate, e.CheckOutDate });
            
            entity.Property(e => e.BookingCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);
            entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
            entity.Property(e => e.FinalPrice).HasPrecision(18, 2);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BookingId);
            entity.HasIndex(e => e.TransactionId);
            
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            
            entity.HasOne(e => e.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RoomAvailability configuration
        modelBuilder.Entity<RoomAvailability>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RoomId, e.Date }).IsUnique();
            
            entity.HasOne(e => e.Room)
                .WithMany(r => r.Availabilities)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RoomImage configuration
        modelBuilder.Entity<RoomImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RoomId);
            
            entity.Property(e => e.ImageUrl).IsRequired();
            
            entity.HasOne(e => e.Room)
                .WithMany(r => r.Images)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PropertyImage configuration
        modelBuilder.Entity<PropertyImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PropertyId);
            
            entity.Property(e => e.ImageUrl).IsRequired();
            
            entity.HasOne(e => e.Property)
                .WithMany(p => p.Images)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RoomAmenity configuration (Many-to-Many)
        modelBuilder.Entity<RoomAmenity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RoomId, e.AmenityId }).IsUnique();
            
            entity.HasOne(e => e.Room)
                .WithMany(r => r.RoomAmenities)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Amenity)
                .WithMany(a => a.RoomAmenities)
                .HasForeignKey(e => e.AmenityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PropertyAmenity configuration (Many-to-Many)
        modelBuilder.Entity<PropertyAmenity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.PropertyId, e.AmenityId }).IsUnique();
            
            entity.HasOne(e => e.Property)
                .WithMany(p => p.Amenities)
                .HasForeignKey(e => e.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Amenity)
                .WithMany(a => a.PropertyAmenities)
                .HasForeignKey(e => e.AmenityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Translation entities
        ConfigureTranslationEntity<CategoryTranslation>(modelBuilder);
        ConfigureTranslationEntity<RoomTranslation>(modelBuilder);
        ConfigureTranslationEntity<AmenityTranslation>(modelBuilder);
        ConfigureTranslationEntity<PropertyTranslation>(modelBuilder);

        // ActivityLog configuration
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.EntityType);
            entity.HasIndex(e => e.LogType);

            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.Details).HasMaxLength(2000);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Apply global query filters
        ApplyGlobalQueryFilters(modelBuilder);
    }

    private static void ConfigureTranslationEntity<T>(ModelBuilder modelBuilder) where T : class
    {
        var entityType = modelBuilder.Entity<T>();
        entityType.HasKey("Id");
        entityType.Property("Id").ValueGeneratedOnAdd();
    }

    private static void ApplyGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        // Soft delete filter for auditable entities
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Property>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Brand>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Room>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Amenity>().HasQueryFilter(e => !e.IsDeleted);
    }
}
