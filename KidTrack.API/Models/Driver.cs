using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Driver
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LicenseNumber { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }
    public string? FcmToken { get; set; }
    public string? OtpHash { get; set; }
    public DateTime? OtpExpiry { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Available"; // Available, OnTrip, OffDuty

    public int SchoolId { get; set; }
    public School School { get; set; } = null!;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Bus? Bus { get; set; }
    public ICollection<TripHistory> TripHistories { get; set; } = new List<TripHistory>();
}
