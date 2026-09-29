using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KidTrack.API.Services;

public interface INotificationService
{
    Task SendAsync(SendNotificationRequest request);
    Task<List<NotificationDto>> GetByParentAsync(int parentId, int page, int pageSize);
    Task MarkReadAsync(int notificationId, int parentId);
    Task SendBoardingAlertAsync(int studentId, DateTime time);
    Task SendAlightingAlertAsync(int studentId, DateTime time);
    Task SendEmergencyAlertAsync(int schoolId, string message);
}

public class NotificationService : INotificationService
{
    private readonly KidTrackDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(KidTrackDbContext db, ILogger<NotificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SendAsync(SendNotificationRequest request)
    {
        var notification = new Notification
        {
            Title = request.Title,
            Body = request.Body,
            Type = request.Type,
            ParentId = request.ParentId,
            StudentId = request.StudentId,
            CreatedAt = DateTime.UtcNow
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // Push via FCM if parent has token
        if (request.ParentId.HasValue)
        {
            var parent = await _db.Parents.FindAsync(request.ParentId);
            if (parent?.FcmToken != null)
                await SendFcmAsync(parent.FcmToken, request.Title, request.Body);
        }

        notification.IsSent = true;
        notification.SentAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<List<NotificationDto>> GetByParentAsync(int parentId, int page, int pageSize)
    {
        return await _db.Notifications
            .Where(n => n.ParentId == parentId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Body, n.Type, n.ParentId,
                n.StudentId, n.IsRead, n.IsSent, n.CreatedAt))
            .ToListAsync();
    }

    public async Task MarkReadAsync(int notificationId, int parentId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.ParentId == parentId);
        if (notification != null)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task SendBoardingAlertAsync(int studentId, DateTime time)
    {
        var student = await _db.Students.Include(s => s.Parents).FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null) return;

        foreach (var parent in student.Parents)
        {
            await SendAsync(new SendNotificationRequest(
                $"{student.FirstName} has boarded the bus",
                $"{student.FirstName} boarded the bus at {time:hh:mm tt}",
                "Boarding", parent.Id, studentId));
        }
    }

    public async Task SendAlightingAlertAsync(int studentId, DateTime time)
    {
        var student = await _db.Students.Include(s => s.Parents).FirstOrDefaultAsync(s => s.Id == studentId);
        if (student == null) return;

        foreach (var parent in student.Parents)
        {
            await SendAsync(new SendNotificationRequest(
                $"{student.FirstName} has alighted",
                $"{student.FirstName} alighted from the bus at {time:hh:mm tt}",
                "Alighting", parent.Id, studentId));
        }
    }

    public async Task SendEmergencyAlertAsync(int schoolId, string message)
    {
        var parentIds = await _db.Students
            .Where(s => s.SchoolId == schoolId)
            .SelectMany(s => s.Parents)
            .Select(p => p.Id)
            .Distinct()
            .ToListAsync();

        foreach (var parentId in parentIds)
        {
            await SendAsync(new SendNotificationRequest(
                "Emergency Alert", message, "Emergency", parentId, null));
        }
    }

    private async Task SendFcmAsync(string token, string title, string body)
    {
        try
        {
            // Firebase must be initialized at startup with service account
            if (FirebaseApp.DefaultInstance == null) return;

            var message = new Message
            {
                Token = token,
                Notification = new FirebaseAdmin.Messaging.Notification
                {
                    Title = title,
                    Body = body
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High
                }
            };
            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("FCM send failed: {Error}", ex.Message);
        }
    }
}
