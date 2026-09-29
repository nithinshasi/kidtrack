using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KidTrack.API.Data;
using KidTrack.API.DTOs;
using KidTrack.API.Models;

namespace KidTrack.API.Controllers;

[ApiController]
[Route("api/drivers")]
[Authorize]
public class DriverController : ControllerBase
{
    private readonly KidTrackDbContext _db;

    public DriverController(KidTrackDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? schoolId)
    {
        var query = _db.Drivers.Where(d => d.IsActive);
        if (schoolId.HasValue) query = query.Where(d => d.SchoolId == schoolId);
        return Ok(await query
            .Select(d => new DriverDto(d.Id, d.FirstName, d.LastName, d.Phone, d.LicenseNumber,
                d.PhotoUrl, d.Status, d.SchoolId, d.IsActive))
            .ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var driver = await _db.Drivers.FindAsync(id);
        return driver == null ? NotFound()
            : Ok(new DriverDto(driver.Id, driver.FirstName, driver.LastName, driver.Phone,
                driver.LicenseNumber, driver.PhotoUrl, driver.Status, driver.SchoolId, driver.IsActive));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateDriverRequest request)
    {
        var driver = new Driver
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            LicenseNumber = request.LicenseNumber,
            SchoolId = request.SchoolId
        };
        _db.Drivers.Add(driver);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = driver.Id },
            new DriverDto(driver.Id, driver.FirstName, driver.LastName, driver.Phone,
                driver.LicenseNumber, driver.PhotoUrl, driver.Status, driver.SchoolId, driver.IsActive));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var driver = await _db.Drivers.FindAsync(id);
        if (driver == null) return NotFound();
        driver.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
