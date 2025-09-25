using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public VisitsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? emr, [FromQuery] string? visitNo, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query = _db.Visits.Include(v => v.Patient).AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(emr)) query = query.Where(v => v.Patient!.EmrNo.Contains(emr));
            if (!string.IsNullOrWhiteSpace(visitNo)) query = query.Where(v => v.VisitNo.Contains(visitNo));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(v => v.VisitDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new
                {
                    v.Id,
                    v.VisitNo,
                    v.VisitDate,
                    v.Department,
                    v.Doctor,
                    v.EncType,
                    v.VatAmount,
                    Patient = new { v.Patient!.Id, v.Patient.EmrNo, v.Patient.Name }
                })
                .ToListAsync();
            return Ok(new { total, items });
        }
    }
}


