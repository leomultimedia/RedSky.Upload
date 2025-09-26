using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var counts = new
        {
            Patients = await _context.Patients.CountAsync(),
            Visits = await _context.Visits.CountAsync(),
            RecentVisits = await _context.Visits
                .Include(v => v.Patient)
                .OrderByDescending(v => v.VisitDate)
                .Take(5)
                .Select(v => new { v.Id, PatientName = v.Patient.Name, v.VisitDate })
                .ToListAsync()
        };
        return Ok(counts);
    }

    [HttpGet("patients")]
    public async Task<IActionResult> GetPatients(
        [FromQuery] string search = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Patients.AsQueryable();
        
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => 
                p.Name.Contains(search) || 
                p.EmrNo.Contains(search) ||
                p.Nationality.Contains(search));
        }

        var total = await query.CountAsync();
        var patients = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total = total, data = patients });
    }

    // Add to DashboardController.cs
    [HttpGet("patient-stats")]
    public async Task<IActionResult> GetPatientStats([FromQuery] string range = "week")
    {
        var dateFrom = range switch
        {
            "week" => DateTime.Today.AddDays(-7),
            "month" => DateTime.Today.AddMonths(-1),
            "year" => DateTime.Today.AddYears(-1),
            _ => DateTime.Today.AddDays(-7)
        };

        var stats = await _context.Visits
            .Where(v => v.VisitDate.HasValue && v.VisitDate.Value >= dateFrom)
            .GroupBy(v => v.VisitDate!.Value.Date)
            .Select(g => new {
                Date = g.Key,
                NewPatients = g.Select(v => v.PatientId).Distinct().Count(),
                ReturningPatients = g.Count()
            })
            .OrderBy(s => s.Date)
            .ToListAsync();

        return Ok(new {
            labels = stats.Select(s => s.Date.ToString("dd MMM")).ToArray(),
            newPatients = stats.Select(s => s.NewPatients).ToArray(),
            returningPatients = stats.Select(s => s.ReturningPatients).ToArray()
        });
    }
    }
}