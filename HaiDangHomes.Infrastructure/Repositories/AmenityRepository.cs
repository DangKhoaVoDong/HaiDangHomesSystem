using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class AmenityRepository : IAmenityRepository
{
    private readonly ApplicationDbContext _context;

    public AmenityRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Amenity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Amenities
            .Include(a => a.Translations)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Amenity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Amenities
            .Include(a => a.Translations)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Amenity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Amenities
            .Include(a => a.Translations)
            .Where(a => a.IsActive)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Amenity>> GetByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default)
    {
        return await _context.RoomAmenities
            .Where(ra => ra.RoomId == roomId)
            .Include(ra => ra.Amenity)
                .ThenInclude(a => a.Translations)
            .Select(ra => ra.Amenity)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Amenity>> GetByPropertyIdAsync(Guid propertyId, CancellationToken cancellationToken = default)
    {
        return await _context.PropertyAmenities
            .Where(pa => pa.PropertyId == propertyId)
            .Include(pa => pa.Amenity)
                .ThenInclude(a => a.Translations)
            .Select(pa => pa.Amenity)
            .ToListAsync(cancellationToken);
    }

    public async Task<Amenity> AddAsync(Amenity amenity, CancellationToken cancellationToken = default)
    {
        await _context.Amenities.AddAsync(amenity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return amenity;
    }

    public async Task UpdateAsync(Amenity amenity, CancellationToken cancellationToken = default)
    {
        amenity.UpdatedAt = DateTime.UtcNow;
        _context.Amenities.Update(amenity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var amenity = await GetByIdAsync(id, cancellationToken);
        if (amenity != null)
        {
            amenity.IsDeleted = true;
            amenity.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(amenity, cancellationToken);
        }
    }
}
