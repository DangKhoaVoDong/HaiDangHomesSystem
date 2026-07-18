using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.Infrastructure.Services;

public class CloudinaryFileStorageService : IFileStorageService
{
    private readonly CloudinaryDotNet.Cloudinary _cloudinary;
    private readonly string _baseUrl;

    public CloudinaryFileStorageService(
        string cloudName,
        string apiKey,
        string apiSecret,
        string? baseUrl = null)
    {
        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new CloudinaryDotNet.Cloudinary(account);
        _baseUrl = baseUrl ?? $"https://res.cloudinary.com/{cloudName}/image/upload";
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        return await UploadAsync(memoryStream.ToArray(), fileName, contentType, cancellationToken);
    }

    public async Task<string> UploadAsync(
        byte[] fileData,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var publicId = $"uploads/{timestamp}/{Guid.NewGuid():N}";

        using var stream = new MemoryStream(fileData);
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(publicId, stream),
            PublicId = publicId,
            Overwrite = true,
            Invalidate = true,
            Folder = "haidanghomes",
            UseFilename = false,
            UniqueFilename = true,
        };

        // Apply transformation based on content type
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            uploadParams.Transformation = new Transformation()
                .Quality("auto")
                .FetchFormat("auto");
        }

        var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (result.Error != null)
        {
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");
        }

        return result.SecureUrl.ToString();
    }

    public async Task<string> GetPresignedUrlAsync(
        string fileKey,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
    {
        // Cloudinary URLs are public by default — just return the URL as-is.
        // If the key is already a Cloudinary URL, return it directly.
        if (fileKey.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            return fileKey;
        }

        // Otherwise construct from public ID
        return await Task.FromResult($"{_baseUrl}/{fileKey}");
    }

    public async Task DeleteAsync(
        string fileKey,
        CancellationToken cancellationToken = default)
    {
        var publicId = ConvertUrlToPublicId(fileKey);

        var deletionParams = new DeletionParams(publicId) { Invalidate = true };

        var result = await _cloudinary.DestroyAsync(deletionParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException($"Cloudinary delete failed: {result.Error.Message}");
        }
    }

    public async Task<bool> ExistsAsync(
        string fileKey,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var publicId = ConvertUrlToPublicId(fileKey);
            var getResourceParams = new GetResourceParams(publicId)
            {
                ResourceType = CloudinaryDotNet.Actions.ResourceType.Image,
            };

            var result = await _cloudinary.GetResourceAsync(getResourceParams);
            return result.Error == null;
        }
        catch
        {
            return false;
        }
    }

    private static string ConvertUrlToPublicId(string fileUrl)
    {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{publicId}
        // We need to extract the public ID from the URL
        if (string.IsNullOrEmpty(fileUrl)) return fileUrl;

        // If it's already a public ID (no dots, no slashes at start), return as-is
        if (!fileUrl.Contains("cloudinary") && !fileUrl.Contains("http"))
        {
            return fileUrl;
        }

        // Extract public ID from Cloudinary URL
        // Pattern: .../upload/v{version}/{publicId} or .../upload/{publicId}
        var uploadMarker = "/upload/";
        var lastUploadIndex = fileUrl.LastIndexOf(uploadMarker, StringComparison.OrdinalIgnoreCase);

        if (lastUploadIndex >= 0)
        {
            var publicIdStart = lastUploadIndex + uploadMarker.Length;
            // Skip version segment if present (e.g., v1234/)
            var remaining = fileUrl[publicIdStart..];
            if (remaining.StartsWith("v") && remaining.Length > 10)
            {
                var nextSlash = remaining.IndexOf('/');
                if (nextSlash > 0 && nextSlash < 15)
                {
                    publicIdStart += nextSlash + 1;
                }
            }
            var publicId = fileUrl[publicIdStart..];
            // Remove file extension
            var extDot = publicId.LastIndexOf('.');
            if (extDot > 0)
            {
                publicId = publicId[..extDot];
            }
            return publicId;
        }

        return fileUrl;
    }
}
