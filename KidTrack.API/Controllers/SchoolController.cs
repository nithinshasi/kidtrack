using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/schools")]
[Authorize(Roles = "Admin")]
public class SchoolController : ControllerBase
{
    private readonly KidTrackDbContext _db;

    public SchoolController(KidTrackDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Schools
            .Select(s => new SchoolDto(s.Id, s.Name, s.Address, s.Phone, s.Email, s.IsActive))
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var school = await _db.Schools.FindAsync(id);
        return school == null ? NotFound()
            : Ok(new SchoolDto(school.Id, school.Name, school.Address, school.Phone, school.Email, school.IsActive));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSchoolRequest request)
    {
        var school = new School
        {
            Name = request.Name,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email
        };
        _db.Schools.Add(school);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = school.Id },
            new SchoolDto(school.Id, school.Name, school.Address, school.Phone, school.Email, school.IsActive));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSchoolRequest request)
    {
        var school = await _db.Schools.FindAsync(id);
        if (school == null) return NotFound();
        school.Name = request.Name;
        school.Address = request.Address;
        school.Phone = request.Phone;
        school.Email = request.Email;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/dashboard")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDashboard(int id)
    {
        var totalStudents = await _db.Students.CountAsync(s => s.SchoolId == id && s.IsActive);
        var totalBuses = await _db.Buses.CountAsync(b => b.SchoolId == id && b.IsActive);
        var activeTrips = await _db.TripHistories
            .Include(t => t.Route)
            .CountAsync(t => t.Route.SchoolId == id && t.Status == "InProgress");
        var todayAttendance = await _db.Attendances
            .Include(a => a.Student)
            .CountAsync(a => a.Student.SchoolId == id && a.Date.Date == DateTime.UtcNow.Date && a.Status == "Present");
        var pendingAlerts = await _db.Notifications
            .CountAsync(n => n.StudentId != null
                && _db.Students.Any(s => s.Id == n.StudentId && s.SchoolId == id)
                && !n.IsSent);

        return Ok(new AdminDashboardDto(totalStudents, totalBuses, activeTrips, todayAttendance, pendingAlerts));
    }
}
