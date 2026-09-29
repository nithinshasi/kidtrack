using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KidTrack.API.DTOs;
using KidTrack.API.Services;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendance;

    public AttendanceController(IAttendanceService attendance) => _attendance = attendance;

    [HttpGet]
    public async Task<IActionResult> GetAttendance(
        [FromQuery] int? tripId,
        [FromQuery] int? studentId,
        [FromQuery] int? schoolId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string tripType = "Morning")
    {
        if (tripId.HasValue)
            return Ok(await _attendance.GetTripAttendanceAsync(tripId.Value));

        if (studentId.HasValue)
            return Ok(await _attendance.GetStudentAttendanceAsync(studentId.Value,
                from ?? DateTime.UtcNow.AddMonths(-1),
                to ?? DateTime.UtcNow));

        if (schoolId.HasValue)
            return Ok(await _attendance.GetSchoolAttendanceAsync(schoolId.Value,
                from ?? DateTime.UtcNow.Date, tripType));

        return BadRequest("Provide tripId, studentId, or schoolId");
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        var result = await _attendance.CheckInAsync(request);
        return result == null ? BadRequest("Invalid trip or student") : Ok(result);
    }
}
