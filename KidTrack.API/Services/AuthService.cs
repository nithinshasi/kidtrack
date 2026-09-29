using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KidTrack.API.Services;

public interface IAuthService
{
    Task<bool> SendOtpAsync(string phone, string userType);
    Task<AuthResponse?> VerifyOtpAsync(VerifyOtpRequest request);
    Task<bool> UpdateFcmTokenAsync(int userId, string userType, string fcmToken);
}

public class AuthService : IAuthService
{
    private readonly KidTrackDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(KidTrackDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(string phone, string userType)
    {
        // Generate 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();
        var otpHash = BCrypt.Net.BCrypt.HashPassword(otp);
        var expiry = DateTime.UtcNow.AddMinutes(10);

        if (userType == "Parent")
        {
            var parent = await _db.Parents.FirstOrDefaultAsync(p => p.Phone == phone);
            if (parent == null) return false;
            parent.OtpHash = otpHash;
            parent.OtpExpiry = expiry;
        }
        else if (userType == "Driver")
        {
            var driver = await _db.Drivers.FirstOrDefaultAsync(d => d.Phone == phone);
            if (driver == null) return false;
            driver.OtpHash = otpHash;
            driver.OtpExpiry = expiry;
        }
        else return false;

        await _db.SaveChangesAsync();

        // In production: integrate SMS provider (Twilio/MSG91) to send OTP
        _logger.LogInformation("OTP for {Phone} ({UserType}): {Otp}", phone, userType, otp);
        return true;
    }

    public async Task<AuthResponse?> VerifyOtpAsync(VerifyOtpRequest request)
    {
        if (request.UserType == "Parent")
        {
            var parent = await _db.Parents.FirstOrDefaultAsync(p => p.Phone == request.Phone);
            if (parent == null || parent.OtpHash == null || parent.OtpExpiry < DateTime.UtcNow)
                return null;
            if (!BCrypt.Net.BCrypt.Verify(request.Otp, parent.OtpHash)) return null;

            parent.OtpHash = null;
            parent.OtpExpiry = null;
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(parent.Id.ToString(), "Parent", parent.Phone);
            return new AuthResponse(token, "Parent", parent.Id, $"{parent.FirstName} {parent.LastName}");
        }
        else if (request.UserType == "Driver")
        {
            var driver = await _db.Drivers.FirstOrDefaultAsync(d => d.Phone == request.Phone);
            if (driver == null || driver.OtpHash == null || driver.OtpExpiry < DateTime.UtcNow)
                return null;
            if (!BCrypt.Net.BCrypt.Verify(request.Otp, driver.OtpHash)) return null;

            driver.OtpHash = null;
            driver.OtpExpiry = null;
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(driver.Id.ToString(), "Driver", driver.Phone);
            return new AuthResponse(token, "Driver", driver.Id, $"{driver.FirstName} {driver.LastName}");
        }
        return null;
    }

    public async Task<bool> UpdateFcmTokenAsync(int userId, string userType, string fcmToken)
    {
        if (userType == "Parent")
        {
            var parent = await _db.Parents.FindAsync(userId);
            if (parent == null) return false;
            parent.FcmToken = fcmToken;
        }
        else if (userType == "Driver")
        {
            var driver = await _db.Drivers.FindAsync(userId);
            if (driver == null) return false;
            driver.FcmToken = fcmToken;
        }
        else return false;

        await _db.SaveChangesAsync();
        return true;
    }

    private string GenerateJwtToken(string userId, string role, string phone)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? "KidTrackDefaultSecretKey2024!@#"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.MobilePhone, phone),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "KidTrack",
            audience: _config["Jwt:Audience"] ?? "KidTrackUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
