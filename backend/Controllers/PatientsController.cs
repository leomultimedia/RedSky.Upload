using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PatientsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query = _db.Patients.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(q))
            {
                query = query.Where(p => p.EmrNo.Contains(q) || (p.Name ?? "").Contains(q));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(p => p.EmrNo)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return Ok(new { total, items });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetById(int id)
        {
            var patient = await _db.Patients.Include(p => p.Visits).FirstOrDefaultAsync(p => p.Id == id);
            if (patient == null) return NotFound();
            return Ok(patient);
        }
    }
}


