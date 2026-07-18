namespace HaiDangHomes.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> UploadAsync(byte[] fileData, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> GetPresignedUrlAsync(string fileKey, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task DeleteAsync(string fileKey, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string fileKey, CancellationToken cancellationToken = default);
}
