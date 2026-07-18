using Microsoft.Extensions.Logging;
using Resend;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _companyName;
    private readonly ILogger<ResendEmailService> _logger;
    private readonly bool _devMode;

    public ResendEmailService(string apiKey, string fromEmail, string companyName, ILogger<ResendEmailService> logger)
    {
        _apiKey = apiKey;
        _fromEmail = fromEmail;
        _companyName = companyName;
        _logger = logger;
        // Dev fallback: skip Resend API call and log content locally when key is missing/invalid.
        _devMode = string.IsNullOrWhiteSpace(apiKey)
                   || apiKey.StartsWith("re_PLACEHOLDER", StringComparison.OrdinalIgnoreCase)
                   || apiKey.Contains("YOUR_RESEND_KEY", StringComparison.OrdinalIgnoreCase);
    }

    private IResend GetClient() => ResendClient.Create(_apiKey);

    public async Task SendBookingConfirmationAsync(
        string toEmail,
        string toName,
        string bookingCode,
        string roomName,
        string propertyName,
        DateTime checkIn,
        DateTime checkOut,
        decimal amount,
        string qrCodeData,
        CancellationToken cancellationToken = default)
    {
        var subject = $"Xác nhận đặt phòng thành công - {bookingCode}";

        var htmlContent = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2c5282; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f7fafc; }}
        .booking-info {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }}
        .info-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }}
        .info-label {{ color: #666; }}
        .info-value {{ font-weight: bold; }}
        .qr-section {{ text-align: center; margin: 20px 0; }}
        .qr-code {{ max-width: 200px; border: 1px solid #ddd; border-radius: 8px; }}
        .amount {{ font-size: 24px; color: #2c5282; font-weight: bold; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{_companyName}</h1>
            <p>Xác nhận đặt phòng</p>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{toName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt phòng tại {_companyName}. Dưới đây là thông tin đặt phòng của bạn:</p>

            <div class='booking-info'>
                <div class='info-row'>
                    <span class='info-label'>Mã đặt phòng:</span>
                    <span class='info-value'>{bookingCode}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Phòng:</span>
                    <span class='info-value'>{roomName}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Cơ sở:</span>
                    <span class='info-value'>{propertyName}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Ngày nhận phòng:</span>
                    <span class='info-value'>{checkIn:dd/MM/yyyy HH:mm}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Ngày trả phòng:</span>
                    <span class='info-value'>{checkOut:dd/MM/yyyy HH:mm}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Số tiền đã thanh toán:</span>
                    <span class='info-value amount'>{amount:N0} VND</span>
                </div>
            </div>

            <div class='qr-section'>
                <h3>Mã QR nhận phòng</h3>
                <p>Vui lòng quét mã QR bên dưới tại quầy lễ tân để nhận phòng nhanh:</p>
                <img src='{qrCodeData}' alt='QR Code' class='qr-code' />
            </div>

            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Vui lòng mang theo CMND/CCCD hoặc hộ chiếu để làm thủ tục nhận phòng.</li>
                <li>Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00</li>
            </ul>
        </div>
        <div class='footer'>
            <p>{_companyName} - Hệ thống đặt phòng trực tuyến</p>
            <p>Hotline: 1900 xxxx | Email: support@haidanghomes.com</p>
        </div>
    </div>
</body>
</html>";

        var email = new EmailMessage
        {
            From = _fromEmail,
            Subject = subject,
            HtmlBody = htmlContent
        };
        email.To.Add(toEmail);

        await SendAsync(email, cancellationToken);
    }

    public async Task SendBookingPendingEmailAsync(
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
        CancellationToken cancellationToken = default)
    {
        var subject = $"Xác nhận yêu cầu đặt phòng - {bookingCode}";

        var htmlContent = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2c5282; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f7fafc; }}
        .booking-info {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }}
        .info-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }}
        .info-label {{ color: #666; }}
        .info-value {{ font-weight: bold; }}
        .amount {{ font-size: 24px; color: #2c5282; font-weight: bold; }}
        .pending-badge {{ background: #f6ad55; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{_companyName}</h1>
            <p>Xác nhận yêu cầu đặt phòng</p>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{toName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt phòng tại {_companyName}. Yêu cầu đặt phòng của bạn đã được tiếp nhận.</p>
            <p><span class='pending-badge'>Đang chờ thanh toán</span></p>

            <div class='booking-info'>
                <div class='info-row'>
                    <span class='info-label'>Mã đặt phòng:</span>
                    <span class='info-value'>{bookingCode}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Phòng:</span>
                    <span class='info-value'>{roomName}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Cơ sở:</span>
                    <span class='info-value'>{propertyName}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Địa chỉ:</span>
                    <span class='info-value'>{propertyAddress}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Ngày nhận phòng:</span>
                    <span class='info-value'>{checkIn:dd/MM/yyyy}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Ngày trả phòng:</span>
                    <span class='info-value'>{checkOut:dd/MM/yyyy}</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Số khách:</span>
                    <span class='info-value'>{numberOfGuests} người</span>
                </div>
                <div class='info-row'>
                    <span class='info-label'>Số tiền cần thanh toán:</span>
                    <span class='info-value amount'>{amount:N0} VND</span>
                </div>
            </div>

            <p><strong>Hướng dẫn thanh toán:</strong></p>
            <p>Vui lòng thanh toán để hoàn tất đặt phòng. Bạn sẽ nhận được email xác nhận sau khi thanh toán thành công.</p>

            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Vui lòng giữ mã đặt phòng: <strong>{bookingCode}</strong></li>
                <li>Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00</li>
                <li>Vui lòng mang theo CMND/CCCD hoặc hộ chiếu để làm thủ tục nhận phòng.</li>
            </ul>
        </div>
        <div class='footer'>
            <p>{_companyName} - Hệ thống đặt phòng trực tuyến</p>
            <p>Hotline: 1900 xxxx | Email: support@haidanghomes.com</p>
        </div>
    </div>
</body>
</html>";

        var email = new EmailMessage
        {
            From = _fromEmail,
            Subject = subject,
            HtmlBody = htmlContent
        };
        email.To.Add(toEmail);

        await SendAsync(email, cancellationToken);
    }

    public async Task SendPasswordResetAsync(
        string toEmail,
        string toName,
        string resetCode,
        CancellationToken cancellationToken = default)
    {
        var subject = "Đặt lại mật khẩu - HaiDang Homes";

        var htmlContent = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2c5282; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f7fafc; }}
        .code {{ font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{_companyName}</h1>
            <p>Đặt lại mật khẩu</p>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{toName}</strong>,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Mã xác minh của bạn:</p>
            <div class='code'>{resetCode}</div>
            <p>Mã này sẽ hết hạn sau 5 phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div class='footer'>
            <p>{_companyName}</p>
        </div>
    </div>
</body>
</html>";

        var email = new EmailMessage
        {
            From = _fromEmail,
            Subject = subject,
            HtmlBody = htmlContent
        };
        email.To.Add(toEmail);

        await SendAsync(email, cancellationToken);
    }

    public async Task SendOtpCodeAsync(
        string toEmail,
        string toName,
        string otpCode,
        CancellationToken cancellationToken = default)
    {
        var subject = "Mã xác minh đăng nhập - HaiDang Homes";

        var htmlContent = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2c5282; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f7fafc; }}
        .code {{ font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{_companyName}</h1>
            <p>Xác minh đăng nhập</p>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{toName}</strong>,</p>
            <p>Mã xác minh của bạn:</p>
            <div class='code'>{otpCode}</div>
            <p>Mã này sẽ hết hạn sau 5 phút.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        </div>
        <div class='footer'>
            <p>{_companyName}</p>
        </div>
    </div>
</body>
</html>";

        var email = new EmailMessage
        {
            From = _fromEmail,
            Subject = subject,
            HtmlBody = htmlContent
        };
        email.To.Add(toEmail);

        await SendAsync(email, cancellationToken);
    }

    private async Task SendAsync(EmailMessage email, CancellationToken cancellationToken)
    {
        if (_devMode)
        {
            // Dev fallback: log the payload locally so flows like registration/OTP can be tested.
            var otpMatch = System.Text.RegularExpressions.Regex.Match(email.HtmlBody ?? string.Empty, @"class=['""]code['""][^>]*>\s*(\d{4,8})");
            var otpCode = otpMatch.Success ? otpMatch.Groups[1].Value : null;

            _logger.LogWarning(
                "[DEV-MODE EMAIL] Skipping Resend API (api key missing/invalid). " +
                "From={From} To={To} Subject={Subject} OTP={Otp}",
                email.From, string.Join(",", email.To), email.Subject, otpCode ?? "(none)");

            if (otpCode != null)
            {
                Console.WriteLine();
                Console.WriteLine("==================================================");
                Console.WriteLine($" DEV-MODE OTP  ->  {email.To.FirstOrDefault()}  :  {otpCode}");
                Console.WriteLine("==================================================");
                Console.WriteLine();
            }
            return;
        }

        await GetClient().EmailSendAsync(email, cancellationToken);
    }
}
