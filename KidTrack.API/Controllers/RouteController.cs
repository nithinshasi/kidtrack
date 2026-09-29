using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using RouteModel = KidTrack.API.Models.Route;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/routes")]
[Authorize]
public class RouteController : ControllerBase
{
    private readonly KidTrackDbContext _db;

    public RouteController(KidTrackDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? schoolId)
    {
        var query = _db.Routes.Where(r => r.IsActive);
        if (schoolId.HasValue) query = query.Where(r => r.SchoolId == schoolId);
        return Ok(await query
            .Select(r => new RouteDto(r.Id, r.Name, r.Description, r.SchoolId, r.BusId,
                r.StopsJson,
                r.MorningStartTime.HasValue ? r.MorningStartTime.Value.ToString(@"hh\:mm") : null,
                r.EveningStartTime.HasValue ? r.EveningStartTime.Value.ToString(@"hh\:mm") : null,
                r.IsActive))
            .ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _db.Routes.FindAsync(id);
        if (r == null) return NotFound();
        return Ok(new RouteDto(r.Id, r.Name, r.Description, r.SchoolId, r.BusId, r.StopsJson,
            r.MorningStartTime?.ToString(@"hh\:mm"), r.EveningStartTime?.ToString(@"hh\:mm"), r.IsActive));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateRouteRequest request)
    {
        var route = new RouteModel
        {
            Name = request.Name,
            Description = request.Description,
            SchoolId = request.SchoolId,
            BusId = request.BusId,
            StopsJson = request.StopsJson,
            MorningStartTime = request.MorningStartTime != null
                ? TimeSpan.Parse(request.MorningStartTime) : null,
            EveningStartTime = request.EveningStartTime != null
                ? TimeSpan.Parse(request.EveningStartTime) : null
        };
        _db.Routes.Add(route);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = route.Id },
            new RouteDto(route.Id, route.Name, route.Description, route.SchoolId, route.BusId,
                route.StopsJson, request.MorningStartTime, request.EveningStartTime, route.IsActive));
    }

    [HttpGet("{id}/students")]
    public async Task<IActionResult> GetStudents(int id) =>
        Ok(await _db.Students
            .Where(s => s.RouteId == id && s.IsActive)
            .Select(s => new StudentDto(s.Id, s.FirstName, s.LastName, s.Grade, s.Section,
                s.RollNumber, s.PhotoUrl, s.QrCode, s.SchoolId, s.RouteId, s.IsActive))
            .ToListAsync());
}
