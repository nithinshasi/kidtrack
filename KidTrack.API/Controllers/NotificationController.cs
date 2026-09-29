using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KidTrack.API.DTOs;
using KidTrack.API.Services;
using System.Security.Claims;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationController(INotificationService notifications) => _notifications = notifications;

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        var notifications = await _notifications.GetByParentAsync(int.Parse(userIdClaim), page, pageSize);
        return Ok(notifications);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        await _notifications.MarkReadAsync(id, int.Parse(userIdClaim));
        return NoContent();
    }

    [HttpPost("send")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Send([FromBody] SendNotificationRequest request)
    {
        await _notifications.SendAsync(request);
        return Ok();
    }

    [HttpPost("emergency")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendEmergency([FromBody] EmergencyAlertRequest request)
    {
        await _notifications.SendEmergencyAlertAsync(request.SchoolId, request.Message);
        return Ok();
    }
}

public record EmergencyAlertRequest(int SchoolId, string Message);
