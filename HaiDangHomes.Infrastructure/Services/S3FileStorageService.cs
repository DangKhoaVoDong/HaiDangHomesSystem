using Amazon.S3;
using Amazon.S3.Model;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.Infrastructure.Services;

public class S3FileStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _cloudFrontDomain;

    public S3FileStorageService(IAmazonS3 s3Client, string bucketName, string? cloudFrontDomain = null)
    {
        _s3Client = s3Client;
        _bucketName = bucketName;
        _cloudFrontDomain = cloudFrontDomain ?? $"https://{bucketName}.s3.amazonaws.com";
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var key = GenerateKey(fileName);
        
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        await _s3Client.PutObjectAsync(request, cancellationToken);

        return GetFileUrl(key);
    }

    public async Task<string> UploadAsync(byte[] fileData, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        using var stream = new MemoryStream(fileData);
        return await UploadAsync(stream, fileName, contentType, cancellationToken);
    }

    public async Task<string> GetPresignedUrlAsync(string fileKey, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            Expires = DateTime.UtcNow.Add(expiration ?? TimeSpan.FromHours(1))
        };

        return await _s3Client.GetPreSignedURLAsync(request);
    }

    public async Task DeleteAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fileKey
        };

        await _s3Client.DeleteObjectAsync(request, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = fileKey
            };

            await _s3Client.GetObjectMetadataAsync(request, cancellationToken);
            return true;
        }
        catch (AmazonS3Exception)
        {
            return false;
        }
    }

    private static string GenerateKey(string fileName)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var extension = Path.GetExtension(fileName);
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        
        return $"uploads/{timestamp}/{uniqueId}{extension}";
    }

    private string GetFileUrl(string key)
    {
        return $"{_cloudFrontDomain}/{key}";
    }
}
