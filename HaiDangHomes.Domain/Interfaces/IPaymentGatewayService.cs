namespace HaiDangHomes.Domain.Interfaces;

public interface IPaymentGatewayService
{
    Task<PaymentGatewayResponse> CreatePaymentUrlAsync(
        Guid bookingId,
        decimal amount,
        string orderInfo,
        CancellationToken cancellationToken = default);
        
    Task<PaymentVerificationResult> VerifyPaymentAsync(
        string transactionId,
        CancellationToken cancellationToken = default);
        
    Task<PaymentVerificationResult> ProcessIpnAsync(
        Dictionary<string, string> parameters,
        CancellationToken cancellationToken = default);
}

public record PaymentGatewayResponse(
    bool Success,
    string? PaymentUrl,
    string? TransactionId,
    string? ErrorMessage);

public record PaymentVerificationResult(
    bool Success,
    Guid BookingId,
    string TransactionId,
    string ResponseCode,
    string? ErrorMessage);
