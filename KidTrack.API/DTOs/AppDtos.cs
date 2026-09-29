namespace KidTrack.API.DTOs;

// Auth
public record SendOtpRequest(string Phone);
public record VerifyOtpRequest(string Phone, string Otp, string UserType); // Parent | Driver
public record AuthResponse(string Token, string UserType, int UserId, string Name);

// School
public record SchoolDto(int Id, string Name, string Address, string Phone, string Email, bool IsActive);
public record CreateSchoolRequest(string Name, string Address, string Phone, string Email);
public record UpdateSchoolRequest(string Name, string Address, string Phone, string Email);

// Student
public record StudentDto(int Id, string FirstName, string LastName, string Grade, string Section,
    string RollNumber, string? PhotoUrl, string? QrCode, int SchoolId, int? RouteId, bool IsActive);
public record CreateStudentRequest(string FirstName, string LastName, string Grade, string Section,
    string RollNumber, int SchoolId, int? RouteId);
public record UpdateStudentRequest(string FirstName, string LastName, string Grade, string Section,
    string RollNumber, int? RouteId);

// Parent
public record ParentDto(int Id, string FirstName, string LastName, string Phone, string Email, bool IsActive);
public record CreateParentRequest(string FirstName, string LastName, string Phone, string Email,
    List<int> StudentIds);

// Bus
public record BusDto(int Id, string RegistrationNumber, string Model, int Capacity, string Status,
    int SchoolId, int? DriverId, double? CurrentLatitude, double? CurrentLongitude,
    DateTime? LastLocationUpdate, bool IsActive);
public record CreateBusRequest(string RegistrationNumber, string Model, int Capacity, int SchoolId);
public record UpdateBusLocationRequest(double Latitude, double Longitude);

// Driver
public record DriverDto(int Id, string FirstName, string LastName, string Phone, string LicenseNumber,
    string? PhotoUrl, string Status, int SchoolId, bool IsActive);
public record CreateDriverRequest(string FirstName, string LastName, string Phone, string LicenseNumber,
    int SchoolId);

// Route
public record RouteDto(int Id, string Name, string Description, int SchoolId, int? BusId,
    string? StopsJson, string? MorningStartTime, string? EveningStartTime, bool IsActive);
public record CreateRouteRequest(string Name, string Description, int SchoolId, int? BusId,
    string? StopsJson, string? MorningStartTime, string? EveningStartTime);

// Attendance
public record AttendanceDto(int Id, int StudentId, string StudentName, int TripHistoryId,
    DateTime Date, string Type, string Status, DateTime? BoardingTime, DateTime? AlightingTime,
    bool QrScanned);
public record CheckInRequest(int TripHistoryId, int StudentId, string? QrCode,
    double? Latitude, double? Longitude);

// Notification
public record NotificationDto(int Id, string Title, string Body, string Type, int? ParentId,
    int? StudentId, bool IsRead, bool IsSent, DateTime CreatedAt);
public record SendNotificationRequest(string Title, string Body, string Type,
    int? ParentId, int? StudentId);

// Trip
public record TripDto(int Id, int RouteId, string RouteName, int BusId, string BusRegNumber,
    int DriverId, string DriverName, string TripType, string Status, DateTime TripDate,
    DateTime? StartTime, DateTime? EndTime);
public record StartTripRequest(int RouteId, int BusId, int DriverId, string TripType,
    double StartLatitude, double StartLongitude);
public record CompleteTripRequest(double EndLatitude, double EndLongitude);

// Location
public record LocationUpdateRequest(int BusId, double Latitude, double Longitude);
public record BusLocationDto(int BusId, string RegistrationNumber, double Latitude, double Longitude,
    DateTime UpdatedAt, string Status);

// Dashboard
public record AdminDashboardDto(int TotalStudents, int TotalBuses, int ActiveTrips,
    int TodayAttendanceCount, int PendingAlerts);
public record ParentDashboardDto(List<StudentDto> Children, List<TripDto> ActiveTrips,
    int UnreadNotifications);
