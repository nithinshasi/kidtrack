using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace KidTrack.API.Services;

public interface ITripService
{
    Task<TripDto?> StartTripAsync(StartTripRequest request);
    Task<TripDto?> CompleteTripAsync(int tripId, CompleteTripRequest request);
    Task<TripDto?> GetActiveTripAsync(int busId);
    Task<List<TripDto>> GetSchoolTripsAsync(int schoolId, DateTime date);
    Task UpdateLocationAsync(LocationUpdateRequest request);
    Task<BusLocationDto?> GetBusLocationAsync(int busId);
}

public class TripService : ITripService
{
    private readonly KidTrackDbContext _db;
    private readonly INotificationService _notifications;

    public TripService(KidTrackDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<TripDto?> StartTripAsync(StartTripRequest request)
    {
        // Check no active trip for same bus
        var existing = await _db.TripHistories
            .FirstOrDefaultAsync(t => t.BusId == request.BusId && t.Status == "InProgress");
        if (existing != null) return null;

        var trip = new TripHistory
        {
            RouteId = request.RouteId,
            BusId = request.BusId,
            DriverId = request.DriverId,
            TripType = request.TripType,
            Status = "InProgress",
            TripDate = DateTime.UtcNow.Date,
            StartTime = DateTime.UtcNow,
            StartLatitude = request.StartLatitude,
            StartLongitude = request.StartLongitude
        };

        _db.TripHistories.Add(trip);

        // Update driver status
        var driver = await _db.Drivers.FindAsync(request.DriverId);
        if (driver != null) driver.Status = "OnTrip";

        await _db.SaveChangesAsync();

        // Update bus location
        var bus = await _db.Buses.FindAsync(request.BusId);
        if (bus != null)
        {
            bus.CurrentLatitude = request.StartLatitude;
            bus.CurrentLongitude = request.StartLongitude;
            bus.LastLocationUpdate = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return await GetTripDtoAsync(trip.Id);
    }

    public async Task<TripDto?> CompleteTripAsync(int tripId, CompleteTripRequest request)
    {
        var trip = await _db.TripHistories.FindAsync(tripId);
        if (trip == null) return null;

        trip.Status = "Completed";
        trip.EndTime = DateTime.UtcNow;
        trip.EndLatitude = request.EndLatitude;
        trip.EndLongitude = request.EndLongitude;

        var driver = await _db.Drivers.FindAsync(trip.DriverId);
        if (driver != null) driver.Status = "Available";

        await _db.SaveChangesAsync();
        return await GetTripDtoAsync(tripId);
    }

    public async Task<TripDto?> GetActiveTripAsync(int busId)
    {
        var trip = await _db.TripHistories
            .FirstOrDefaultAsync(t => t.BusId == busId && t.Status == "InProgress");
        return trip == null ? null : await GetTripDtoAsync(trip.Id);
    }

    public async Task<List<TripDto>> GetSchoolTripsAsync(int schoolId, DateTime date)
    {
        var tripIds = await _db.TripHistories
            .Include(t => t.Route)
            .Where(t => t.Route.SchoolId == schoolId && t.TripDate.Date == date.Date)
            .Select(t => t.Id)
            .ToListAsync();

        var result = new List<TripDto>();
        foreach (var id in tripIds)
        {
            var dto = await GetTripDtoAsync(id);
            if (dto != null) result.Add(dto);
        }
        return result;
    }

    public async Task UpdateLocationAsync(LocationUpdateRequest request)
    {
        var bus = await _db.Buses.FindAsync(request.BusId);
        if (bus == null) return;

        bus.CurrentLatitude = request.Latitude;
        bus.CurrentLongitude = request.Longitude;
        bus.LastLocationUpdate = DateTime.UtcNow;

        // Store GPS point in active trip
        var trip = await _db.TripHistories
            .FirstOrDefaultAsync(t => t.BusId == request.BusId && t.Status == "InProgress");

        if (trip != null)
        {
            var points = string.IsNullOrEmpty(trip.TrackingPointsJson)
                ? new List<object>()
                : JsonSerializer.Deserialize<List<object>>(trip.TrackingPointsJson) ?? new List<object>();

            points.Add(new { lat = request.Latitude, lng = request.Longitude, ts = DateTime.UtcNow });

            // Keep last 500 points to avoid bloat
            if (points.Count > 500) points = points.TakeLast(500).ToList();
            trip.TrackingPointsJson = JsonSerializer.Serialize(points);
        }

        await _db.SaveChangesAsync();
    }

    public async Task<BusLocationDto?> GetBusLocationAsync(int busId)
    {
        var bus = await _db.Buses.FindAsync(busId);
        if (bus?.CurrentLatitude == null) return null;

        return new BusLocationDto(bus.Id, bus.RegistrationNumber,
            bus.CurrentLatitude!.Value, bus.CurrentLongitude!.Value,
            bus.LastLocationUpdate!.Value, bus.Status);
    }

    private async Task<TripDto?> GetTripDtoAsync(int tripId)
    {
        return await _db.TripHistories
            .Include(t => t.Route)
            .Include(t => t.Bus)
            .Include(t => t.Driver)
            .Where(t => t.Id == tripId)
            .Select(t => new TripDto(t.Id, t.RouteId, t.Route.Name, t.BusId,
                t.Bus.RegistrationNumber, t.DriverId,
                $"{t.Driver.FirstName} {t.Driver.LastName}",
                t.TripType, t.Status, t.TripDate, t.StartTime, t.EndTime))
            .FirstOrDefaultAsync();
    }
}
