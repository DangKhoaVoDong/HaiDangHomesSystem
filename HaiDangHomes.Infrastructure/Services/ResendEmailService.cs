using Microsoft.Extensions.Logging;
using Resend;
using HaiDangHomes.Domain.Interfaces;
using System.Net;
using System.Text.RegularExpressions;

namespace HaiDangHomes.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private const string DefaultSenderEmail = "booking@haidanghomes.com";
    private static readonly Regex EmailPattern = new(
        @"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled);
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _adminNotificationEmail;
    private readonly string _companyName;
    private readonly ILogger<ResendEmailService> _logger;
    private readonly bool _devMode;

    public ResendEmailService(
        string apiKey,
        string fromEmail,
        string adminNotificationEmail,
        string companyName,
        ILogger<ResendEmailService> logger)
    {
        // Dev fallback: skip Resend API call and log content locally when key is missing/invalid.
        _devMode = string.IsNullOrWhiteSpace(apiKey)
                   || apiKey.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase)
                   || apiKey.StartsWith("re_PLACEHOLDER", StringComparison.OrdinalIgnoreCase)
                   || apiKey.Contains("YOUR_RESEND_KEY", StringComparison.OrdinalIgnoreCase);
        _apiKey = apiKey.Trim();
        _fromEmail = _devMode ? fromEmail.Trim() : NormalizeEmailAddress(fromEmail);
        _adminNotificationEmail = string.IsNullOrWhiteSpace(adminNotificationEmail)
            || adminNotificationEmail.StartsWith("REPLACE_", StringComparison.OrdinalIgnoreCase)
            ? string.Empty
            : NormalizeEmailAddress(adminNotificationEmail);
        _companyName = companyName;
        _logger = logger;

        _logger.LogInformation(
            "Resend email service configured. Enabled={Enabled}, From={From}, AdminNotifications={AdminNotifications}",
            !_devMode,
            _fromEmail,
            !string.IsNullOrWhiteSpace(_adminNotificationEmail));
    }

    private IResend GetClient() => ResendClient.Create(_apiKey);

    private static string NormalizeEmailAddress(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return DefaultSenderEmail;
        }

        // Keep service construction non-throwing: environment dashboards can add
        // quotes or invisible whitespace. Resend accepts the plain address most
        // reliably across SDK versions.
        var match = EmailPattern.Match(value);
        return match.Success ? match.Value : DefaultSenderEmail;
    }

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
            <p><span class='pending-badge'>Đang kiểm tra tình trạng phòng</span></p>
            <p>Đội ngũ của chúng tôi đang kiểm tra phòng và sẽ phản hồi cho bạn trong thời gian sớm nhất. Đây chưa phải là xác nhận giữ phòng.</p>

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
                    <span class='info-label'>Chi phí dự kiến:</span>
                    <span class='info-value amount'>{amount:N0} VND</span>
                </div>
            </div>

            <p><strong>Bước tiếp theo:</strong></p>
            <p>Chúng tôi sẽ liên hệ qua email hoặc số điện thoại bạn đã cung cấp ngay sau khi kiểm tra tình trạng phòng.</p>

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

    public async Task SendNewBookingNotificationAsync(
        string guestName,
        string guestEmail,
        string guestPhone,
        string bookingCode,
        string roomName,
        string propertyName,
        DateTime checkIn,
        DateTime checkOut,
        decimal amount,
        int numberOfGuests,
        string? specialRequests,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_adminNotificationEmail))
        {
            _logger.LogWarning(
                "Admin booking notification skipped for {BookingCode}: Resend:AdminNotificationEmail is not configured.",
                bookingCode);
            return;
        }

        var safeGuestName = WebUtility.HtmlEncode(guestName);
        var safeGuestEmail = WebUtility.HtmlEncode(guestEmail);
        var safeGuestPhone = WebUtility.HtmlEncode(guestPhone);
        var safeBookingCode = WebUtility.HtmlEncode(bookingCode);
        var safeRoomName = WebUtility.HtmlEncode(roomName);
        var safePropertyName = WebUtility.HtmlEncode(propertyName);
        var safeSpecialRequests = WebUtility.HtmlEncode(
            string.IsNullOrWhiteSpace(specialRequests) ? "Không có" : specialRequests);

        var htmlContent = $@"
<!DOCTYPE html>
<html lang='vi'>
<body style='font-family:Arial,sans-serif;line-height:1.6;color:#333'>
  <div style='max-width:640px;margin:auto;padding:20px'>
    <h2 style='color:#c2410c'>Có yêu cầu đặt phòng mới</h2>
    <p>Một khách hàng vừa gửi yêu cầu đặt phòng trên hệ thống.</p>
    <table style='width:100%;border-collapse:collapse'>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Mã đặt phòng</td><td style='padding:8px;border-bottom:1px solid #eee'><strong>{safeBookingCode}</strong></td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Khách hàng</td><td style='padding:8px;border-bottom:1px solid #eee'>{safeGuestName}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Email</td><td style='padding:8px;border-bottom:1px solid #eee'>{safeGuestEmail}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Số điện thoại</td><td style='padding:8px;border-bottom:1px solid #eee'>{safeGuestPhone}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Cơ sở / Phòng</td><td style='padding:8px;border-bottom:1px solid #eee'>{safePropertyName} / {safeRoomName}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Thời gian</td><td style='padding:8px;border-bottom:1px solid #eee'>{checkIn:dd/MM/yyyy} - {checkOut:dd/MM/yyyy}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Số khách</td><td style='padding:8px;border-bottom:1px solid #eee'>{numberOfGuests}</td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Chi phí dự kiến</td><td style='padding:8px;border-bottom:1px solid #eee'><strong>{amount:N0} VND</strong></td></tr>
      <tr><td style='padding:8px;border-bottom:1px solid #eee'>Yêu cầu thêm</td><td style='padding:8px;border-bottom:1px solid #eee'>{safeSpecialRequests}</td></tr>
    </table>
    <p>Vui lòng đăng nhập trang quản trị để kiểm tra và xử lý yêu cầu.</p>
  </div>
</body>
</html>";

        var email = new EmailMessage
        {
            From = _fromEmail,
            Subject = $"[Đặt phòng mới] {bookingCode}",
            HtmlBody = htmlContent
        };
        email.To.Add(_adminNotificationEmail);

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

        var receipt = await GetClient().EmailSendAsync(email, cancellationToken);
        if (!receipt.Success)
        {
            if (receipt.Exception is not null)
            {
                throw receipt.Exception;
            }

            throw new InvalidOperationException("Resend rejected the email without an error message.");
        }

        _logger.LogInformation(
            "Resend accepted email {EmailId}. From={From}, To={To}, Subject={Subject}",
            receipt.Content,
            email.From,
            string.Join(",", email.To),
            email.Subject);
    }
}
