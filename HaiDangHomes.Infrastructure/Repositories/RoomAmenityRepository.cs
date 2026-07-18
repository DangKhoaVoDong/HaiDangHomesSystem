using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class RoomAmenityRepository : IRoomAmenityRepository
{
    private readonly ApplicationDbContext _context;

    public RoomAmenityRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RoomAmenity roomAmenity, CancellationToken cancellationToken = default)
    {
        await _context.RoomAmenities.AddAsync(roomAmenity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<RoomAmenity> roomAmenities, CancellationToken cancellationToken = default)
    {
        await _context.RoomAmenities.AddRangeAsync(roomAmenities, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default)
    {
        var rows = await _context.RoomAmenities.Where(ra => ra.RoomId == roomId).ToListAsync(cancellationToken);
        if (rows.Count > 0)
        {
            _context.RoomAmenities.RemoveRange(rows);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}