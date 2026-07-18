using HaiDangHomes.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace HaiDangHomes.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalFileStorageService(IConfiguration configuration)
    {
        _basePath = configuration["FileStorage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        _baseUrl = configuration["FileStorage:LocalUrl"] ?? "/uploads";

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        return await UploadAsync(memoryStream.ToArray(), fileName, contentType, cancellationToken);
    }

    public async Task<string> UploadAsync(byte[] fileData, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var extension = Path.GetExtension(fileName);
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var relativePath = $"uploads/{timestamp}/{uniqueId}{extension}";

        var fullPath = Path.Combine(_basePath, timestamp);
        if (!Directory.Exists(fullPath))
        {
            Directory.CreateDirectory(fullPath);
        }

        var fullFilePath = Path.Combine(_basePath, relativePath);
        await File.WriteAllBytesAsync(fullFilePath, fileData, cancellationToken);

        return $"{_baseUrl}/{relativePath.Replace("\\", "/")}";
    }

    public Task<string> GetPresignedUrlAsync(string fileKey, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var url = $"{_baseUrl}/{fileKey.Replace("\\", "/")}";
        return Task.FromResult(url);
    }

    public async Task DeleteAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        var cleanKey = fileKey.Replace("\\", "/").Replace($"{_baseUrl}/", "");
        var fullPath = Path.Combine(_basePath, cleanKey);
        if (File.Exists(fullPath))
        {
            await Task.Run(() => File.Delete(fullPath), cancellationToken);
        }
    }

    public Task<bool> ExistsAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        var cleanKey = fileKey.Replace("\\", "/").Replace($"{_baseUrl}/", "");
        var fullPath = Path.Combine(_basePath, cleanKey);
        return Task.FromResult(File.Exists(fullPath));
    }
}
