using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;

namespace HaiDangHomes.Domain.Interfaces;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Room?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Room>> GetByPropertyIdAsync(Guid propertyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int guests, CancellationToken cancellationToken = default);
    Task<IEnumerable<Room>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Room> AddAsync(Room room, CancellationToken cancellationToken = default);
    Task UpdateAsync(Room room, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Manager specific methods
    Task<List<Room>> GetRoomsForManagementAsync(
        Guid? propertyId,
        RoomOperationalStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<int> GetTotalCountForManagementAsync(
        Guid? propertyId,
        RoomOperationalStatus? status,
        CancellationToken cancellationToken = default);
}
