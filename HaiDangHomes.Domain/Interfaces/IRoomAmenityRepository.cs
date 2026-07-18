using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IRoomAmenityRepository
{
    Task AddAsync(RoomAmenity roomAmenity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<RoomAmenity> roomAmenities, CancellationToken cancellationToken = default);
    Task DeleteByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default);
}