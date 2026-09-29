using System.ComponentModel.DataAnnotations;

namespace KidTrack.API.Models;

public class Notification
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Body { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "General"; // Boarding, Alighting, Delay, Emergency, General

    public int? ParentId { get; set; }
    public Parent? Parent { get; set; }

    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
    public bool IsSent { get; set; } = false;
}
