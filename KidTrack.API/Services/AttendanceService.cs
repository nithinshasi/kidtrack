using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KidTrack.API.Services;

public interface IAttendanceService
{
    Task<AttendanceDto?> CheckInAsync(CheckInRequest request);
    Task<List<AttendanceDto>> GetTripAttendanceAsync(int tripId);
    Task<List<AttendanceDto>> GetStudentAttendanceAsync(int studentId, DateTime from, DateTime to);
    Task<List<AttendanceDto>> GetSchoolAttendanceAsync(int schoolId, DateTime date, string tripType);
}

public class AttendanceService : IAttendanceService
{
    private readonly KidTrackDbContext _db;
    private readonly INotificationService _notifications;

    public AttendanceService(KidTrackDbContext db, INotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    public async Task<AttendanceDto?> CheckInAsync(CheckInRequest request)
    {
        var trip = await _db.TripHistories.FindAsync(request.TripHistoryId);
        var student = await _db.Students.FindAsync(request.StudentId);
        if (trip == null || student == null) return null;

        // Find existing or create
        var attendance = await _db.Attendances
            .FirstOrDefaultAsync(a => a.TripHistoryId == request.TripHistoryId
                                   && a.StudentId == request.StudentId)
            ?? new Attendance
            {
                TripHistoryId = request.TripHistoryId,
                StudentId = request.StudentId,
                Date = trip.TripDate,
                Type = trip.TripType
            };

        attendance.Status = "Present";
        attendance.BoardingTime = DateTime.UtcNow;
        attendance.BoardingLatitude = request.Latitude;
        attendance.BoardingLongitude = request.Longitude;
        attendance.QrScanned = request.QrCode != null;

        if (attendance.Id == 0)
            _db.Attendances.Add(attendance);

        await _db.SaveChangesAsync();

        // Send boarding notification to parents
        await _notifications.SendBoardingAlertAsync(request.StudentId, attendance.BoardingTime!.Value);

        return MapToDto(attendance, student);
    }

    public async Task<List<AttendanceDto>> GetTripAttendanceAsync(int tripId)
    {
        return await _db.Attendances
            .Include(a => a.Student)
            .Where(a => a.TripHistoryId == tripId)
            .Select(a => new AttendanceDto(a.Id, a.StudentId,
                $"{a.Student.FirstName} {a.Student.LastName}",
                a.TripHistoryId, a.Date, a.Type, a.Status,
                a.BoardingTime, a.AlightingTime, a.QrScanned))
            .ToListAsync();
    }

    public async Task<List<AttendanceDto>> GetStudentAttendanceAsync(int studentId, DateTime from, DateTime to)
    {
        return await _db.Attendances
            .Include(a => a.Student)
            .Where(a => a.StudentId == studentId && a.Date >= from && a.Date <= to)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceDto(a.Id, a.StudentId,
                $"{a.Student.FirstName} {a.Student.LastName}",
                a.TripHistoryId, a.Date, a.Type, a.Status,
                a.BoardingTime, a.AlightingTime, a.QrScanned))
            .ToListAsync();
    }

    public async Task<List<AttendanceDto>> GetSchoolAttendanceAsync(int schoolId, DateTime date, string tripType)
    {
        return await _db.Attendances
            .Include(a => a.Student)
            .Where(a => a.Student.SchoolId == schoolId
                     && a.Date.Date == date.Date
                     && a.Type == tripType)
            .Select(a => new AttendanceDto(a.Id, a.StudentId,
                $"{a.Student.FirstName} {a.Student.LastName}",
                a.TripHistoryId, a.Date, a.Type, a.Status,
                a.BoardingTime, a.AlightingTime, a.QrScanned))
            .ToListAsync();
    }

    private AttendanceDto MapToDto(Attendance a, Student s) =>
        new(a.Id, a.StudentId, $"{s.FirstName} {s.LastName}",
            a.TripHistoryId, a.Date, a.Type, a.Status,
            a.BoardingTime, a.AlightingTime, a.QrScanned);
}
