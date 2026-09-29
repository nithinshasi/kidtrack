using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KidTrack.API.DTOs;
using KidTrack.API.Services;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/bus")]
[Authorize]
public class BusController : ControllerBase
{
    private readonly ITripService _tripService;
    private readonly Microsoft.EntityFrameworkCore.DbContext _db;

    public BusController(ITripService tripService, Data.KidTrackDbContext db)
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
        var ctx = (Data.KidTrackDbContext)_db;
        var query = ctx.Buses.Where(b => b.IsActive);
        if (schoolId.HasValue) query = query.Where(b => b.SchoolId == schoolId);

        var buses = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .ToListAsync(query.Select(b => new BusDto(b.Id, b.RegistrationNumber, b.Model,
                b.Capacity, b.Status, b.SchoolId, b.DriverId,
                b.CurrentLatitude, b.CurrentLongitude, b.LastLocationUpdate, b.IsActive)));
        return Ok(buses);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBus([FromBody] CreateBusRequest request)
    {
        var ctx = (Data.KidTrackDbContext)_db;
        var bus = new Models.Bus
        {
            RegistrationNumber = request.RegistrationNumber,
            Model = request.Model,
            Capacity = request.Capacity,
            SchoolId = request.SchoolId
        };
        ctx.Buses.Add(bus);
        await ctx.SaveChangesAsync();
        return Ok(new BusDto(bus.Id, bus.RegistrationNumber, bus.Model, bus.Capacity, bus.Status,
            bus.SchoolId, bus.DriverId, bus.CurrentLatitude, bus.CurrentLongitude,
            bus.LastLocationUpdate, bus.IsActive));
    }
}
