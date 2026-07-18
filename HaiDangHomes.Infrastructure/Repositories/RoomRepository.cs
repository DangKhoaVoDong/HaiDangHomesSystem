using Microsoft.EntityFrameworkCore;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly ApplicationDbContext _context;

    public RoomRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Rooms.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Room?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .Include(r => r.Property)
                .ThenInclude(p => p.Host)
            .Include(r => r.Property)
                .ThenInclude(p => p.Category)
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .Include(r => r.Availabilities)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Room>> GetByPropertyIdAsync(Guid propertyId, CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .Include(r => r.Images)
            .Where(r => r.PropertyId == propertyId)
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int guests, CancellationToken cancellationToken = default)
    {
        var unavailableRoomIds = await _context.Bookings
            .Where(b =>
                b.Status != Domain.Enums.BookingStatus.Cancelled &&
                b.Status != Domain.Enums.BookingStatus.Refunded &&
                b.CheckInDate < checkOut &&
                b.CheckOutDate > checkIn)
            .Select(b => b.RoomId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return await _context.Rooms
            .Include(r => r.Property)
            .Include(r => r.Images)
            .Where(r =>
                r.IsActive &&
                r.IsAvailable &&
                r.MaxOccupancy >= guests &&
                !unavailableRoomIds.Contains(r.Id))
            .OrderBy(r => r.PricePerNight)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Room>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .Include(r => r.Property)
            .Include(r => r.Images)
            .ToListAsync(cancellationToken);
    }

    public async Task<Room> AddAsync(Room room, CancellationToken cancellationToken = default)
    {
        await _context.Rooms.AddAsync(room, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return room;
    }

    public async Task UpdateAsync(Room room, CancellationToken cancellationToken = default)
    {
        room.UpdatedAt = DateTime.UtcNow;
        _context.Rooms.Update(room);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var room = await GetByIdAsync(id, cancellationToken);
        if (room != null)
        {
            room.IsDeleted = true;
            room.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(room, cancellationToken);
        }
    }

    public async Task<List<Room>> GetRoomsForManagementAsync(
        Guid? propertyId,
        RoomOperationalStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Rooms
            .Include(r => r.Property)
                .ThenInclude(p => p.Category)
            .Include(r => r.Images)
            .Include(r => r.RoomAmenities)
                .ThenInclude(ra => ra.Amenity)
            .AsQueryable();

        if (propertyId.HasValue)
            query = query.Where(r => r.PropertyId == propertyId.Value);

        if (status.HasValue)
            query = query.Where(r => r.OperationalStatus == status.Value);

        return await query
            .OrderBy(r => r.Property.Name)
            .ThenBy(r => r.RoomNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetTotalCountForManagementAsync(
        Guid? propertyId,
        RoomOperationalStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Rooms.AsQueryable();

        if (propertyId.HasValue)
            query = query.Where(r => r.PropertyId == propertyId.Value);

        if (status.HasValue)
            query = query.Where(r => r.OperationalStatus == status.Value);

        return await query.CountAsync(cancellationToken);
    }
}
