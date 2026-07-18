using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IRoomImageRepository
{
    Task AddAsync(RoomImage image, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<RoomImage> images, CancellationToken cancellationToken = default);
    Task DeleteByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default);
}