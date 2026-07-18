namespace HaiDangHomes.Domain.Interfaces;

public interface IEmailService
{
    Task SendBookingConfirmationAsync(
        string toEmail,
        string toName,
        string bookingCode,
        string roomName,
        string propertyName,
        DateTime checkIn,
        DateTime checkOut,
        decimal amount,
        string qrCodeData,
        CancellationToken cancellationToken = default);

    Task SendBookingPendingEmailAsync(
        string toEmail,
        string toName,
        string bookingCode,
        string roomName,
        string propertyName,
        string propertyAddress,
        DateTime checkIn,
        DateTime checkOut,
        decimal amount,
        int numberOfGuests,
        CancellationToken cancellationToken = default);
        
    Task SendPasswordResetAsync(
        string toEmail,
        string toName,
        string resetCode,
        CancellationToken cancellationToken = default);
        
    Task SendOtpCodeAsync(
        string toEmail,
        string toName,
        string otpCode,
        CancellationToken cancellationToken = default);
}
