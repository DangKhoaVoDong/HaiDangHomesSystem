using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly ApplicationDbContext _context;

    public PropertyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Properties.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Property?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Host)
            .Include(p => p.Category)
            .Include(p => p.Rooms)
            .Include(p => p.Images)
            .Include(p => p.Amenities)
                .ThenInclude(pa => pa.Amenity)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Property>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Host)
            .Include(p => p.Category)
            .Include(p => p.Rooms)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Property>> GetFeaturedAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Rooms)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Property>> GetByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default)
    {
        return await _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Rooms)
            .Where(p => p.HostId == hostId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Property>> SearchAsync(string? searchTerm, Guid? categoryId, CancellationToken cancellationToken = default)
    {
        var query = _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Rooms)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.Address.ToLower().Contains(searchTerm) ||
                (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<Property> AddAsync(Property property, CancellationToken cancellationToken = default)
    {
        await _context.Properties.AddAsync(property, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return property;
    }

    public async Task UpdateAsync(Property property, CancellationToken cancellationToken = default)
    {
        property.UpdatedAt = DateTime.UtcNow;
        _context.Properties.Update(property);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        // Hard-delete the property so EF cascades to its Rooms (configured
        // with DeleteBehavior.Cascade). Soft-deleting the Property alone
        // leaves orphan Rooms that still reference PropertyId in the DB
        // while the global query filter hides the parent.
        var property = await _context.Properties
            .Include(p => p.Rooms)
                .ThenInclude(r => r.Bookings)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (property == null) return;

        var hasActiveBookings = property.Rooms
            .SelectMany(r => r.Bookings)
            .Any(b => b.Status != Domain.Enums.BookingStatus.Cancelled
                   && b.Status != Domain.Enums.BookingStatus.Completed);
        if (hasActiveBookings)
        {
            throw new InvalidOperationException(
                "Khong the xoa can ho dang co booking dang hoat dong.");
        }

        _context.Properties.Remove(property);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
