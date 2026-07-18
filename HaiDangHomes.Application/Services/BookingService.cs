using HaiDangHomes.Application.Common;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Domain.ValueObjects;

namespace HaiDangHomes.Application.Services;

public interface IBookingService
{
    Task<BookingResult> CreateBookingAsync(
        Guid? userId,
        Guid roomId,
        DateTime checkIn,
        DateTime checkOut,
        int guests,
        string? specialRequests,
        string? guestFullName,
        string? guestEmail,
        string? guestPhone,
        string? guestIdCardNumber,
        string? guestAddress);

    Task<BookingResult> UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? cancellationReason = null);
    Task ProcessLoyaltyPointsAsync(Guid bookingId);
}

public record BookingResult(
    bool Success,
    Booking? Booking = null,
    decimal OriginalPrice = 0,
    decimal DiscountAmount = 0,
    decimal FinalPrice = 0,
    int PointsEarned = 0,
    string? Error = null);

public record BookingPriceResult(
    decimal OriginalPrice,
    decimal DiscountAmount,
    decimal FinalPrice,
    int PointsEarned);

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IQrCodeService _qrCodeService;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public BookingService(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IQrCodeService qrCodeService,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _qrCodeService = qrCodeService;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingResult> CreateBookingAsync(
        Guid? userId,
        Guid roomId,
        DateTime checkIn,
        DateTime checkOut,
        int guests,
        string? specialRequests,
        string? guestFullName,
        string? guestEmail,
        string? guestPhone,
        string? guestIdCardNumber,
        string? guestAddress)
    {
        // Validate room exists and is available
        var room = await _roomRepository.GetByIdWithDetailsAsync(roomId);
        if (room == null)
        {
            return new BookingResult(false, Error: "Room not found");
        }

        if (!room.IsAvailable || !room.IsActive)
        {
            return new BookingResult(false, Error: "Room is not available");
        }

        // Check availability
        var isAvailable = await _bookingRepository.IsRoomAvailableAsync(roomId, checkIn, checkOut);
        if (!isAvailable)
        {
            return new BookingResult(false, Error: "Room is not available for selected dates");
        }

        // Validate guest count
        if (guests > room.MaxOccupancy)
        {
            return new BookingResult(false, Error: $"Maximum occupancy is {room.MaxOccupancy} guests");
        }

        // Validate dates
        var dateRange = new DateRange(checkIn, checkOut);
        var numberOfNights = dateRange.NumberOfNights;

        if (numberOfNights < 1)
        {
            return new BookingResult(false, Error: "Minimum stay is 1 night");
        }

        // Calculate price
        var priceResult = CalculateBookingPriceResult(userId, room.PricePerNight, numberOfNights);

        // Generate booking code
        var bookingCode = GenerateBookingCode();

        // Generate QR code
        var qrData = $"BOOKING:{bookingCode}|ROOM:{room.RoomNumber}|CHECKIN:{checkIn:yyyyMMddHHmm}";
        var qrCode = await _qrCodeService.GenerateQrCodeAsync(qrData);

        // Create booking
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BookingCode = bookingCode,
            UserId = userId ?? Guid.Empty,
            RoomId = roomId,
            CheckInDate = checkIn,
            CheckOutDate = checkOut,
            NumberOfGuests = guests,
            OriginalPrice = priceResult.OriginalPrice,
            DiscountAmount = priceResult.DiscountAmount,
            FinalPrice = priceResult.FinalPrice,
            PointsEarned = priceResult.PointsEarned,
            Status = BookingStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            QrCode = qrCode,
            SpecialRequests = specialRequests,
            GuestFullName = guestFullName,
            GuestEmail = guestEmail,
            GuestPhone = guestPhone,
            GuestIdCardNumber = guestIdCardNumber,
            GuestAddress = guestAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddAsync(booking);

        // Send pending booking email to guest
        var property = await _unitOfWork.Properties.GetByIdAsync(room.PropertyId);
        var guestEmailToSend = guestEmail;
        var guestName = guestFullName;

        // If user is logged in, use their info
        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            var user = await _userRepository.GetByIdAsync(userId.Value);
            if (user != null && !user.IsGuest)
            {
                guestEmailToSend = user.Email;
                guestName = user.FullName;
            }
        }

        if (!string.IsNullOrEmpty(guestEmailToSend))
        {
            try
            {
                await _emailService.SendBookingPendingEmailAsync(
                    guestEmailToSend,
                    guestName ?? "Khách hàng",
                    bookingCode,
                    room.Name,
                    property?.Name ?? "",
                    property?.Address ?? "",
                    checkIn,
                    checkOut,
                    priceResult.FinalPrice,
                    guests);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the booking
                Console.WriteLine($"Failed to send pending booking email: {ex.Message}");
            }
        }

        return new BookingResult(
            true,
            booking,
            priceResult.OriginalPrice,
            priceResult.DiscountAmount,
            priceResult.FinalPrice,
            priceResult.PointsEarned);
    }

    public async Task<BookingResult> UpdateBookingStatusAsync(Guid bookingId, BookingStatus newStatus, string? cancellationReason = null)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
        {
            return new BookingResult(false, Error: "Booking not found");
        }

        // Validate status transition
        if (!IsValidStatusTransition(booking.Status, newStatus))
        {
            return new BookingResult(false, Error: $"Cannot transition from {booking.Status} to {newStatus}");
        }

        booking.Status = newStatus;
        
        switch (newStatus)
        {
            case BookingStatus.Confirmed:
                booking.PaymentStatus = PaymentStatus.Paid;
                booking.PaidAt = DateTime.UtcNow;
                // Send confirmation email
                await SendBookingConfirmationEmailAsync(booking);
                break;
                
            case BookingStatus.CheckedIn:
                booking.CheckedInAt = DateTime.UtcNow;
                break;
                
            case BookingStatus.Completed:
                booking.CompletedAt = DateTime.UtcNow;
                // Process loyalty points
                await ProcessLoyaltyPointsAsync(bookingId);
                break;
                
            case BookingStatus.Cancelled:
                booking.CancellationReason = cancellationReason;
                booking.PaymentStatus = PaymentStatus.Refunded;
                break;
        }

        await _bookingRepository.UpdateAsync(booking);

        return new BookingResult(true, booking);
    }

    public BookingPriceResult CalculateBookingPriceResult(Guid? userId, decimal pricePerNight, int numberOfNights)
    {
        var originalPrice = pricePerNight * numberOfNights;
        decimal discountAmount = 0;
        int pointsEarned = 0;

        // Apply loyalty discount for registered users only
        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            // Note: User lookup needs to be done before calling this method
            // This is a simplified version
        }

        var finalPrice = originalPrice - discountAmount;
        return new BookingPriceResult(originalPrice, discountAmount, finalPrice, pointsEarned);
    }

    public async Task ProcessLoyaltyPointsAsync(Guid bookingId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null || booking.UserId == Guid.Empty)
        {
            return;
        }

        var user = await _userRepository.GetByIdAsync(booking.UserId);
        if (user == null || user.IsGuest)
        {
            return;
        }

        // Add points
        user.LoyaltyPoints += booking.PointsEarned;
        
        // Check for tier upgrade
        var newTier = MembershipConstants.CalculateTier(user.LoyaltyPoints);
        if (newTier > user.MembershipTier)
        {
            user.MembershipTier = newTier;
        }
        
        user.LastPointsCalculationDate = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
    }

    private async Task SendBookingConfirmationEmailAsync(Booking booking)
    {
        var room = await _roomRepository.GetByIdAsync(booking.RoomId);
        if (room == null) return;

        var property = await _unitOfWork.Properties.GetByIdAsync(room.PropertyId);
        if (property == null) return;

        var email = booking.UserId != Guid.Empty 
            ? (await _userRepository.GetByIdAsync(booking.UserId))?.Email 
            : booking.GuestEmail;
            
        var name = booking.UserId != Guid.Empty 
            ? (await _userRepository.GetByIdAsync(booking.UserId))?.FullName 
            : booking.GuestFullName;

        if (string.IsNullOrEmpty(email)) return;

        await _emailService.SendBookingConfirmationAsync(
            email,
            name ?? "Khách hàng",
            booking.BookingCode,
            room.Name,
            property.Name,
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.FinalPrice,
            booking.QrCode ?? "");
    }

    private static bool IsValidStatusTransition(BookingStatus current, BookingStatus next)
    {
        return (current, next) switch
        {
            (BookingStatus.Pending, BookingStatus.Confirmed) => true,
            (BookingStatus.Pending, BookingStatus.Cancelled) => true,
            (BookingStatus.Confirmed, BookingStatus.CheckedIn) => true,
            (BookingStatus.Confirmed, BookingStatus.Cancelled) => true,
            (BookingStatus.Confirmed, BookingStatus.Refunded) => true,
            (BookingStatus.CheckedIn, BookingStatus.Completed) => true,
            (BookingStatus.CheckedIn, BookingStatus.Cancelled) => true,
            _ => false
        };
    }

    private static string GenerateBookingCode()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = new Random().Next(1000, 9999);
        return $"HD{timestamp}{random}";
    }
}
