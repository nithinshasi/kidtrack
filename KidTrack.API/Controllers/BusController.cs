using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;
using KidTrack.API.Services;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/bus")]
[Authorize]
public class BusController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly KidTrackDbContext _db;

    public BusController(ITripService tripService, KidTrackDbContext db)
    {
        _tripService = tripService;
        _db = db;
    }

    [HttpGet("{id}/location")]
    public async Task<IActionResult> GetLocation(int id)
    {
        var location = await _tripService.GetBusLocationAsync(id);
        return location == null ? NotFound() : Ok(location);
    }

    [HttpPost("location")]
    public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdateRequest request)
    {
        await _tripService.UpdateLocationAsync(request);
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> GetBuses([FromQuery] int? schoolId)
    {
        var query = _db.Buses.Where(b => b.IsActive);
        if (schoolId.HasValue) query = query.Where(b => b.SchoolId == schoolId);

        var buses = await query.Select(b => new BusDto(
            b.Id, b.RegistrationNumber, b.Model,
            b.Capacity, b.Status, b.SchoolId, b.DriverId,
            b.CurrentLatitude, b.CurrentLongitude, b.LastLocationUpdate, b.IsActive))
            .ToListAsync();
        return Ok(buses);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBus([FromBody] CreateBusRequest request)
    {
        var bus = new Bus
        {
            RegistrationNumber = request.RegistrationNumber,
            Model = request.Model,
            Capacity = request.Capacity,
            SchoolId = request.SchoolId
        };
        _db.Buses.Add(bus);
        await _db.SaveChangesAsync();
        return Ok(new BusDto(bus.Id, bus.RegistrationNumber, bus.Model, bus.Capacity, bus.Status,
            bus.SchoolId, bus.DriverId, bus.CurrentLatitude, bus.CurrentLongitude,
            bus.LastLocationUpdate, bus.IsActive));
    }
}
