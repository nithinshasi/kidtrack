using Microsoft.AspNetCore.Mvc;
using KidTrack.API.DTOs;
using KidTrack.API.Services;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Send OTP to phone number</summary>
    [HttpPost("login")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request,
        [FromQuery] string userType = "Parent")
    {
        var result = await _authService.SendOtpAsync(request.Phone, userType);
        if (!result) return NotFound(new { message = "User not found with this phone number" });
        return Ok(new { message = "OTP sent successfully" });
    }

    /// <summary>Verify OTP and get JWT token</summary>
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request);
        if (result == null) return Unauthorized(new { message = "Invalid or expired OTP" });
        return Ok(result);
    }

    /// <summary>Update FCM token for push notifications</summary>
    [HttpPost("fcm-token")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateFcmToken([FromBody] UpdateFcmTokenDto dto)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userIdClaim == null || roleClaim == null) return Unauthorized();

        var result = await _authService.UpdateFcmTokenAsync(int.Parse(userIdClaim), roleClaim, dto.FcmToken);
        return result ? Ok() : BadRequest();
    }
}

public record UpdateFcmTokenDto(string FcmToken);
