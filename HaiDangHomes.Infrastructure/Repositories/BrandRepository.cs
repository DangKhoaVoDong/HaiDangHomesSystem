using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HaiDangHomes.Infrastructure.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly ApplicationDbContext _context;

    public BrandRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Brand?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Brands
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Brand?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name)) return null;
        var upper = name.Trim().ToUpperInvariant();
        return await _context.Brands
            .FirstOrDefaultAsync(b => b.Name.ToUpper() == upper, cancellationToken);
    }

    public async Task<IEnumerable<Brand>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Brands.AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }
        return await query
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Brand> AddAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        await _context.Brands.AddAsync(brand, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return brand;
    }

    public async Task UpdateAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        brand.UpdatedAt = DateTime.UtcNow;
        _context.Brands.Update(brand);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
