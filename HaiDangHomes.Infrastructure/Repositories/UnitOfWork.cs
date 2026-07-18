using Microsoft.EntityFrameworkCore.Storage;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Infrastructure.Persistence;

namespace HaiDangHomes.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IUserRepository? _users;
    private IBookingRepository? _bookings;
    private IRoomRepository? _rooms;
    private IPropertyRepository? _properties;
    private ICategoryRepository? _categories;
    private IAmenityRepository? _amenities;
    private IRefreshTokenRepository? _refreshTokens;
    private IPaymentRepository? _payments;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IBookingRepository Bookings => _bookings ??= new BookingRepository(_context);
    public IRoomRepository Rooms => _rooms ??= new RoomRepository(_context);
    public IPropertyRepository Properties => _properties ??= new PropertyRepository(_context);
    public ICategoryRepository Categories => _categories ??= new CategoryRepository(_context);
    public IAmenityRepository Amenities => _amenities ??= new AmenityRepository(_context);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
    public IPaymentRepository Payments => _payments ??= new PaymentRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
