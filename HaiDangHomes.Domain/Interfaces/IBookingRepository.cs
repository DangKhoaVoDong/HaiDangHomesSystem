using HaiDangHomes.Domain.Entities;

namespace HaiDangHomes.Domain.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Booking?> GetByCodeAsync(string bookingCode, CancellationToken cancellationToken = default);
    Task<Booking?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Booking?> GetByPaymentTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByRoomIdAsync(Guid roomId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<IEnumerable<Booking>> GetByUserIdAndStatusAsync(Guid userId, Enums.BookingStatus status, CancellationToken cancellationToken = default);
    Task<Booking> AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> IsRoomAvailableAsync(Guid roomId, DateTime checkIn, DateTime checkOut, CancellationToken cancellationToken = default);

    // Manager/Admin specific methods
    Task<List<Booking>> GetBookingsInRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    Task<List<Booking>> GetBookingsForCalendarAsync(
        DateTime startDate,
        DateTime endDate,
        Guid? propertyId = null,
        CancellationToken cancellationToken = default);

    Task<List<Booking>> GetBookingsByPropertyAsync(
        Guid propertyId,
        CancellationToken cancellationToken = default);

    Task<List<Booking>> GetBookingsByRoomAsync(
        Guid roomId,
        CancellationToken cancellationToken = default);
}
