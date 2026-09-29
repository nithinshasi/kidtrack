using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KidTrack.API.DTOs;
using KidTrack.API.Services;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/trips")]
[Authorize]
public class TripController : ControllerBase
{
    private readonly ITripService _trips;

    public TripController(ITripService trips) => _trips = trips;

    [HttpPost("start")]
    public async Task<IActionResult> StartTrip([FromBody] StartTripRequest request)
    {
        var trip = await _trips.StartTripAsync(request);
        return trip == null
            ? BadRequest("Could not start trip. A trip may already be in progress for this bus.")
            : Ok(trip);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTrip(int id, [FromBody] CompleteTripRequest request)
    {
        var trip = await _trips.CompleteTripAsync(id, request);
        return trip == null ? NotFound() : Ok(trip);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveTrip([FromQuery] int busId)
    {
        var trip = await _trips.GetActiveTripAsync(busId);
        return trip == null ? NotFound() : Ok(trip);
    }

    [HttpGet]
    public async Task<IActionResult> GetTrips([FromQuery] int schoolId, [FromQuery] DateTime? date)
    {
        var trips = await _trips.GetSchoolTripsAsync(schoolId, date ?? DateTime.UtcNow.Date);
        return Ok(trips);
    }
}
