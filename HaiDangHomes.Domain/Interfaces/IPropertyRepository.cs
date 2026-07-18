using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IPropertyRepository
{
    Task<Property?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Property?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Property>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Property>> GetFeaturedAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<IEnumerable<Property>> GetByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Property>> SearchAsync(string? searchTerm, Guid? categoryId, CancellationToken cancellationToken = default);
    Task<Property> AddAsync(Property property, CancellationToken cancellationToken = default);
    Task UpdateAsync(Property property, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
