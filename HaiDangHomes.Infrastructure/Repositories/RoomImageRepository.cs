using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class RoomImageRepository : IRoomImageRepository
{
    private readonly ApplicationDbContext _context;

    public RoomImageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RoomImage image, CancellationToken cancellationToken = default)
    {
        await _context.RoomImages.AddAsync(image, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<RoomImage> images, CancellationToken cancellationToken = default)
    {
        await _context.RoomImages.AddRangeAsync(images, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default)
    {
        var images = await _context.RoomImages.Where(i => i.RoomId == roomId).ToListAsync(cancellationToken);
        if (images.Count > 0)
        {
            _context.RoomImages.RemoveRange(images);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}