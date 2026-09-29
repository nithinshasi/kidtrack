using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Route
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int SchoolId { get; set; }
    public School School { get; set; } = null!;

    public int? BusId { get; set; }
    public Bus? Bus { get; set; }

    public string? StopsJson { get; set; } // JSON array of stops [{name, lat, lng, order}]
    public TimeSpan? MorningStartTime { get; set; }
    public TimeSpan? EveningStartTime { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<TripHistory> TripHistories { get; set; } = new List<TripHistory>();
}
