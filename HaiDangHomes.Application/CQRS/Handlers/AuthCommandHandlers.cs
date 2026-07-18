using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Services;
using HaiDangHomes.Domain.Enums;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(
            request.Email,
            request.PhoneNumber,
            request.Password,
            request.FullName);

        if (!result.Success)
        {
            return Result<AuthResponse>.Failure(result.Error ?? "Registration failed");
        }

        return Result<AuthResponse>.Success(new AuthResponse(
            result.AccessToken!,
            result.RefreshToken!,
            result.ExpiresAt!.Value,
            result.User!.ToDto()));
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);

        if (!result.Success)
        {
            return Result<AuthResponse>.Failure(result.Error ?? "Login failed");
        }

        return Result<AuthResponse>.Success(new AuthResponse(
            result.AccessToken!,
            result.RefreshToken!,
            result.ExpiresAt!.Value,
            result.User!.ToDto()));
    }
}

public class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public VerifyOtpCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.VerifyOtpAsync(request.Email, request.OtpCode);

        if (!result.Success)
        {
            return Result<AuthResponse>.Failure(result.Error ?? "OTP verification failed");
        }

        return Result<AuthResponse>.Success(new AuthResponse(
            result.AccessToken!,
            result.RefreshToken!,
            result.ExpiresAt!.Value,
            result.User!.ToDto()));
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public RefreshTokenCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);

        if (!result.Success)
        {
            return Result<AuthResponse>.Failure(result.Error ?? "Token refresh failed");
        }

        return Result<AuthResponse>.Success(new AuthResponse(
            result.AccessToken!,
            result.RefreshToken!,
            result.ExpiresAt!.Value,
            result.User!.ToDto()));
    }
}

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IAuthService _authService;

    public LogoutCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _authService.LogoutAsync(Guid.Empty, request.RefreshToken);
        return Result.Success();
    }
}

// User mapping extension
public static class UserMappingExtensions
{
    public static UserDto ToDto(this Domain.Entities.User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.PhoneNumber,
            user.FullName,
            user.AvatarUrl,
            user.Role,
            user.IsVerified,
            user.LoyaltyPoints,
            user.MembershipTier);
    }
}
