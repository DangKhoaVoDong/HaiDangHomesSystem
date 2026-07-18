using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IAmenityRepository
{
    Task<Amenity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Amenity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Amenity>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Amenity>> GetByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Amenity>> GetByPropertyIdAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<Amenity> AddAsync(Amenity amenity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Amenity amenity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
