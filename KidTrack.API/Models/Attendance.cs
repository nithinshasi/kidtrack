using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Attendance
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public int TripHistoryId { get; set; }
    public TripHistory TripHistory { get; set; } = null!;

    public DateTime Date { get; set; }

    [MaxLength(20)]
    public string Type { get; set; } = "Morning"; // Morning, Evening

    [MaxLength(20)]
    public string Status { get; set; } = "Absent"; // Present, Absent, Late

    public DateTime? BoardingTime { get; set; }
    public DateTime? AlightingTime { get; set; }

    public double? BoardingLatitude { get; set; }
    public double? BoardingLongitude { get; set; }

    public bool QrScanned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
