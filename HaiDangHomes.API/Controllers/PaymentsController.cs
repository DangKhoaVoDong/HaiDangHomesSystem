using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Domain.Interfaces;
using HaiDangHomes.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public PaymentsController(
        IPaymentGatewayService paymentService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _paymentService = paymentService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    [HttpPost("create-payment-url")]
    public async Task<ActionResult> CreatePaymentUrl([FromBody] CreatePaymentRequest request)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(request.BookingId);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        var orderInfo = $"Thanh toan don hang {booking.BookingCode}";
        
        var result = await _paymentService.CreatePaymentUrlAsync(
            request.BookingId,
            booking.FinalPrice,
            orderInfo);

        if (!result.Success)
            return BadRequest(new { success = false, message = result.ErrorMessage });

        return Ok(new
        {
            success = true,
            paymentUrl = result.PaymentUrl,
            transactionId = result.TransactionId
        });
    }

    [HttpGet("payos-return")]
    public ActionResult PayOSReturn(
        [FromQuery] string code,
        [FromQuery] string id,
        [FromQuery] string orderCode)
    {
        // PayOS returns to this endpoint after payment
        // code = "00" means success
        var baseUrl = _configuration["App:Url"] ?? (Request.Scheme + "://" + Request.Host);
        if (code == "00" && !string.IsNullOrEmpty(orderCode))
        {
            return Redirect($"{baseUrl}/booking/success?orderCode={orderCode}");
        }

        return Redirect($"{baseUrl}/booking/failed?orderCode={orderCode}");
    }

    [HttpPost("payos-webhook")]
    public async Task<ActionResult> PayOSWebhook([FromBody] PayOSWebhookRequest webhookData)
    {
        try
        {
            var parameters = new Dictionary<string, string>
            {
                ["code"] = webhookData.Code ?? "",
                ["orderCode"] = webhookData.OrderCode?.ToString() ?? "",
                ["transactionId"] = webhookData.TransactionId ?? ""
            };

            var result = await _paymentService.ProcessIpnAsync(parameters);

            if (result.Success && result.BookingId != Guid.Empty)
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(result.BookingId);
                if (booking != null)
                {
                    booking.Status = BookingStatus.Confirmed;
                    booking.PaymentStatus = PaymentStatus.Paid;
                    booking.PaymentTransactionId = result.TransactionId;
                    booking.PaidAt = DateTime.UtcNow;
                    await _unitOfWork.Bookings.UpdateAsync(booking);

                    // Send confirmation email
                    await SendBookingConfirmationEmailAsync(booking);
                }

                return Ok(new { success = true, message = "Payment processed successfully" });
            }

            return Ok(new { success = false, message = result.ErrorMessage ?? "Payment verification failed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("check-status/{orderCode}")]
    public async Task<ActionResult> CheckPaymentStatus(long orderCode)
    {
        try
        {
            var result = await _paymentService.VerifyPaymentAsync(orderCode.ToString());
            
            return Ok(new
            {
                success = result.Success,
                bookingId = result.BookingId,
                transactionId = result.TransactionId,
                responseCode = result.ResponseCode
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private async Task SendBookingConfirmationEmailAsync(Domain.Entities.Booking booking)
    {
        try
        {
            var room = await _unitOfWork.Rooms.GetByIdAsync(booking.RoomId);
            var property = room != null ? await _unitOfWork.Properties.GetByIdAsync(room.PropertyId) : null;
            
            string? email = booking.GuestEmail;
            string? name = booking.GuestFullName;

            if (booking.UserId != Guid.Empty)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(booking.UserId);
                email ??= user?.Email;
                name ??= user?.FullName;
            }

            if (!string.IsNullOrEmpty(email))
            {
                // Get email service from DI if available
                // var emailService = HttpContext.RequestServices.GetService<IEmailService>();
                // await emailService.SendBookingConfirmationAsync(...);
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail the request
            Console.WriteLine($"Failed to send confirmation email: {ex.Message}");
        }
    }
}

public record CreatePaymentRequest(Guid BookingId);

public class PayOSWebhookRequest
{
    public string? Code { get; set; }
    public string? Desc { get; set; }
    public long? OrderCode { get; set; }
    public string? TransactionId { get; set; }
    public string? TransactionType { get; set; }
    public string? Amount { get; set; }
    public long? BookingId { get; set; }
}
