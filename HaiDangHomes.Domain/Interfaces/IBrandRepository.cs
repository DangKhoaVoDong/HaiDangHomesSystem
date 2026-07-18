using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IBrandRepository
{
    Task<Brand?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Brand?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<Brand>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<Brand> AddAsync(Brand brand, CancellationToken cancellationToken = default);
    Task UpdateAsync(Brand brand, CancellationToken cancellationToken = default);
}
