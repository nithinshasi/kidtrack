using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Bus
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string RegistrationNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    public int Capacity { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Active"; // Active, Maintenance, Inactive

    public int SchoolId { get; set; }
    public School School { get; set; } = null!;

    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    public double? CurrentLatitude { get; set; }
    public double? CurrentLongitude { get; set; }
    public DateTime? LastLocationUpdate { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TripHistory> TripHistories { get; set; } = new List<TripHistory>();
}
