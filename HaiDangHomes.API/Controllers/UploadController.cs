using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public UploadController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    /// <summary>
    /// Upload một file ảnh lên S3 và trả về URL công khai.
    /// </summary>
    [HttpPost("image")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<ApiResponse<ImageUploadResult>>> UploadImage(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<ImageUploadResult>.ErrorResponse("File is empty"));

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(ApiResponse<ImageUploadResult>.ErrorResponse(
                $"Unsupported content type: {file.ContentType}. Allowed: jpg, png, webp, gif."));

        if (file.Length > MaxFileSize)
            return BadRequest(ApiResponse<ImageUploadResult>.ErrorResponse(
                $"File too large ({file.Length / 1024 / 1024} MB). Max: {MaxFileSize / 1024 / 1024} MB."));

        await using var stream = file.OpenReadStream();
        var url = await _fileStorage.UploadAsync(
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        return Ok(ApiResponse<ImageUploadResult>.SuccessResponse(
            new ImageUploadResult(url, url),
            "Upload successful"));
    }
}
