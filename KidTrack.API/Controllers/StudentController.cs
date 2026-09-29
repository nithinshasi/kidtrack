using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/students")]
[Authorize]
public class StudentController : ControllerBase
{
    private readonly KidTrackDbContext _db;

    public StudentController(KidTrackDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? schoolId, [FromQuery] int? routeId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = _db.Students.AsQueryable();
        if (schoolId.HasValue) query = query.Where(s => s.SchoolId == schoolId);
        if (routeId.HasValue) query = query.Where(s => s.RouteId == routeId);

        var students = await query
            .Where(s => s.IsActive)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StudentDto(s.Id, s.FirstName, s.LastName, s.Grade, s.Section,
                s.RollNumber, s.PhotoUrl, s.QrCode, s.SchoolId, s.RouteId, s.IsActive))
            .ToListAsync();

        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _db.Students
            .Where(s => s.Id == id)
            .Select(s => new StudentDto(s.Id, s.FirstName, s.LastName, s.Grade, s.Section,
                s.RollNumber, s.PhotoUrl, s.QrCode, s.SchoolId, s.RouteId, s.IsActive))
            .FirstOrDefaultAsync();

        return student == null ? NotFound() : Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStudentRequest request)
    {
        var qrCode = Guid.NewGuid().ToString("N")[..12].ToUpper();
        var student = new Student
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Grade = request.Grade,
            Section = request.Section,
            RollNumber = request.RollNumber,
            SchoolId = request.SchoolId,
            RouteId = request.RouteId,
            QrCode = qrCode
        };
        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = student.Id },
            new StudentDto(student.Id, student.FirstName, student.LastName, student.Grade,
                student.Section, student.RollNumber, student.PhotoUrl, student.QrCode,
                student.SchoolId, student.RouteId, student.IsActive));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentRequest request)
    {
        var student = await _db.Students.FindAsync(id);
        if (student == null) return NotFound();

        student.FirstName = request.FirstName;
        student.LastName = request.LastName;
        student.Grade = request.Grade;
        student.Section = request.Section;
        student.RollNumber = request.RollNumber;
        student.RouteId = request.RouteId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student == null) return NotFound();
        student.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/parents")]
    public async Task<IActionResult> GetParents(int id)
    {
        var parents = await _db.Students
            .Where(s => s.Id == id)
            .SelectMany(s => s.Parents)
            .Select(p => new ParentDto(p.Id, p.FirstName, p.LastName, p.Phone, p.Email, p.IsActive))
            .ToListAsync();
        return Ok(parents);
    }
}
