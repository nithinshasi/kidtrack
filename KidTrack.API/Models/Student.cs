using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Student
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Grade { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Section { get; set; } = string.Empty;

    [MaxLength(100)]
    public string RollNumber { get; set; } = string.Empty;

    public string? QrCode { get; set; }
    public string? PhotoUrl { get; set; }

    public int SchoolId { get; set; }
    public School School { get; set; } = null!;

    public int? RouteId { get; set; }
    public Route? Route { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Parent> Parents { get; set; } = new List<Parent>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
