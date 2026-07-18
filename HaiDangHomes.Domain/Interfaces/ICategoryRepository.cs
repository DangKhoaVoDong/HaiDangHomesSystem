using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Category>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default);
    Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Upsert a CategoryTranslation row. If a row with (CategoryId, Language) already
    /// exists, it is updated. Otherwise a new row is added. All changes are persisted
    /// in a single SaveChangesAsync call.
    /// </summary>
    Task UpsertTranslationAsync(
        CategoryTranslation translation,
        CancellationToken cancellationToken = default);
}
