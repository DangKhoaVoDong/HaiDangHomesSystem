using QRCoder;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.Infrastructure.Services;

public class QrCodeService : IQrCodeService
{
    public Task<string> GenerateQrCodeAsync(string data, CancellationToken cancellationToken = default)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(20);
        
        var base64 = Convert.ToBase64String(qrCodeBytes);
        return Task.FromResult($"data:image/png;base64,{base64}");
    }
}
