using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _context;

    public CategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Translations)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Translations)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Category>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Translations)
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _context.Categories.AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        category.UpdatedAt = DateTime.UtcNow;
        _context.Categories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await GetByIdAsync(id, cancellationToken);
        if (category != null)
        {
            category.IsDeleted = true;
            category.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(category, cancellationToken);
        }
    }

    public async Task UpsertTranslationAsync(
        CategoryTranslation translation,
        CancellationToken cancellationToken = default)
    {
        // Toggle global query filter off — translations are owned-by and tracked anyway,
        // but the explicit lookup avoids hitting a soft-deleted row.
        var existing = await _context.CategoryTranslations
            .FirstOrDefaultAsync(t =>
                t.CategoryId == translation.CategoryId &&
                t.Language == translation.Language,
                cancellationToken);

        if (existing != null)
        {
            existing.Name = translation.Name;
            existing.Description = translation.Description;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            await _context.CategoryTranslations.AddAsync(translation, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
