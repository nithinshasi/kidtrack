using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class TripHistory
{
    public int Id { get; set; }

    public int RouteId { get; set; }
    public Route Route { get; set; } = null!;

    public int BusId { get; set; }
    public Bus Bus { get; set; } = null!;

    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;

    [MaxLength(20)]
    public string TripType { get; set; } = "Morning"; // Morning, Evening

    [MaxLength(20)]
    public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled

    public DateTime TripDate { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public double? StartLatitude { get; set; }
    public double? StartLongitude { get; set; }
    public double? EndLatitude { get; set; }
    public double? EndLongitude { get; set; }

    public string? TrackingPointsJson { get; set; } // JSON array of GPS points
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
