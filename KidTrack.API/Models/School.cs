using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class School
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Bus> Buses { get; set; } = new List<Bus>();
    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
    public ICollection<Route> Routes { get; set; } = new List<Route>();
}
