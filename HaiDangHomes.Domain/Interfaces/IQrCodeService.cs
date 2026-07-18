namespace HaiDangHomes.Domain.Interfaces;

public interface IQrCodeService
{
    Task<string> GenerateQrCodeAsync(string data, CancellationToken cancellationToken = default);
}
