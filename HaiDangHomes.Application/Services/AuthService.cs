using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;

namespace HaiDangHomes.Application.Services;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(string email, string? phoneNumber, string password, string fullName);
    Task<AuthResult> LoginAsync(string email, string password);
    Task<AuthResult> VerifyOtpAsync(string email, string otpCode);
    Task<AuthResult> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId, string refreshToken);
    string GenerateJwtToken(User user);
    RefreshToken GenerateRefreshToken(string ipAddress);
}

public record AuthResult(
    bool Success,
    string? AccessToken = null,
    string? RefreshToken = null,
    DateTime? ExpiresAt = null,
    User? User = null,
    string? Error = null);

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IEmailService _emailService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IEmailService emailService,
        JwtSettings jwtSettings)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _emailService = emailService;
        _jwtSettings = jwtSettings;
    }

    public async Task<AuthResult> RegisterAsync(string email, string? phoneNumber, string password, string fullName)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null)
        {
            return new AuthResult(false, Error: "Email already registered");
        }

        if (!string.IsNullOrEmpty(phoneNumber))
        {
            var existingPhone = await _userRepository.GetByPhoneAsync(phoneNumber);
            if (existingPhone != null)
            {
                return new AuthResult(false, Error: "Phone number already registered");
            }
        }

        var otpCode = GenerateOtpCode();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLower(),
            PhoneNumber = phoneNumber,
            PasswordHash = HashPassword(password),
            FullName = fullName,
            VerificationCode = otpCode,
            VerificationCodeExpiresAt = DateTime.UtcNow.Add(BookingConstants.OtpExpirationTime),
            IsGuest = false,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        
        // Send OTP email (in production, this would be an actual email)
        await _emailService.SendOtpCodeAsync(email, fullName, otpCode);

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken("127.0.0.1");
        refreshToken.UserId = user.Id;
        await _refreshTokenRepository.AddAsync(refreshToken);

        return new AuthResult(
            true,
            accessToken,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user);
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return new AuthResult(false, Error: "Invalid email or password");
        }

        if (!VerifyPassword(password, user.PasswordHash))
        {
            return new AuthResult(false, Error: "Invalid email or password");
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken("127.0.0.1");
        refreshToken.UserId = user.Id;
        await _refreshTokenRepository.AddAsync(refreshToken);

        return new AuthResult(
            true,
            accessToken,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user);
    }

    public async Task<AuthResult> VerifyOtpAsync(string email, string otpCode)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return new AuthResult(false, Error: "User not found");
        }

        if (user.VerificationCode != otpCode)
        {
            return new AuthResult(false, Error: "Invalid OTP code");
        }

        if (user.VerificationCodeExpiresAt < DateTime.UtcNow)
        {
            return new AuthResult(false, Error: "OTP code has expired");
        }

        user.IsVerified = true;
        user.VerificationCode = null;
        user.VerificationCodeExpiresAt = null;
        await _userRepository.UpdateAsync(user);

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken("127.0.0.1");
        refreshToken.UserId = user.Id;
        await _refreshTokenRepository.AddAsync(refreshToken);

        return new AuthResult(
            true,
            accessToken,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            user);
    }

    public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (token == null || !token.IsActive)
        {
            return new AuthResult(false, Error: "Invalid or expired refresh token");
        }

        var user = await _userRepository.GetByIdAsync(token.UserId);
        if (user == null)
        {
            return new AuthResult(false, Error: "User not found");
        }

        // Revoke old token
        token.RevokedAt = DateTime.UtcNow;
        await _refreshTokenRepository.UpdateAsync(token);

        // Generate new tokens
        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken("127.0.0.1");
        newRefreshToken.UserId = user.Id;
        await _refreshTokenRepository.AddAsync(newRefreshToken);

        return new AuthResult(
            true,
            newAccessToken,
            newRefreshToken.Token,
            newRefreshToken.ExpiresAt,
            user);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (token != null && token.UserId == userId)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(token);
        }
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("fullName", user.FullName),
            new Claim("isGuest", user.IsGuest.ToString().ToLower())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public RefreshToken GenerateRefreshToken(string ipAddress)
    {
        using var rng = RandomNumberGenerator.Create();
        var randomBytes = new byte[64];
        rng.GetBytes(randomBytes);

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryInDays),
            CreatedAt = DateTime.UtcNow,
            RevokedByIp = ipAddress
        };
    }

    private static string GenerateOtpCode()
    {
        return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
    }

    private static string HashPassword(string password)
    {
        const int iterations = 210_000;
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password, salt, iterations, HashAlgorithmName.SHA256, 32);
        return $"PBKDF2-SHA256${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var parts = hash.Split('$');
        if (parts.Length == 4 &&
            parts[0] == "PBKDF2-SHA256" &&
            int.TryParse(parts[1], out var iterations))
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expected = Convert.FromBase64String(parts[3]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(
                password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }

        // Backward compatibility for existing SHA-256 hashes. New registrations
        // and password changes always use PBKDF2.
        var legacy = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return CryptographicOperations.FixedTimeEquals(
            legacy, Convert.FromBase64String(hash));
    }
}

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryInMinutes { get; set; } = 60;
    public int RefreshTokenExpiryInDays { get; set; } = 7;
}
