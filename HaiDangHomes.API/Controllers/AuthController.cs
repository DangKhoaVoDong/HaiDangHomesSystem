using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.DTOs;

namespace HaiDangHomes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterCommand(request.Email, request.PhoneNumber, request.Password, request.FullName);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<AuthResponse>.ErrorResponse(result.Error ?? "Registration failed"));

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Value!, "Registration successful"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email, request.Password);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return Unauthorized(ApiResponse<AuthResponse>.ErrorResponse(result.Error ?? "Login failed"));

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Value!, "Login successful"));
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var command = new VerifyOtpCommand(request.Email, request.OtpCode);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(ApiResponse<AuthResponse>.ErrorResponse(result.Error ?? "Verification failed"));

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Value!, "Verification successful"));
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var command = new RefreshTokenCommand(request.RefreshToken);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return Unauthorized(ApiResponse<AuthResponse>.ErrorResponse(result.Error ?? "Token refresh failed"));

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(result.Value!, "Token refreshed"));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenRequest request)
    {
        var command = new LogoutCommand(request.RefreshToken);
        await _mediator.Send(command);

        return Ok(ApiResponse.SuccessResponse("Logged out successfully"));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Unauthorized"));

        var result = await _mediator.Send(new GetCurrentUserQuery(Guid.Parse(userId)));

        if (result == null)
            return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(result));
    }
}

public record VerifyOtpRequest(string Email, string OtpCode);
public record RefreshTokenRequest(string RefreshToken);
