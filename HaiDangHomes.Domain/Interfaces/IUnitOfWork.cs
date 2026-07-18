namespace HaiDangHomes.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IBookingRepository Bookings { get; }
    IRoomRepository Rooms { get; }
    IPropertyRepository Properties { get; }
    ICategoryRepository Categories { get; }
    IAmenityRepository Amenities { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    IPaymentRepository Payments { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
