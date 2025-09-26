using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TreatmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TreatmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/treatments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Treatment>>> GetTreatments([FromQuery] string? search = null, [FromQuery] string? category = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.Treatments.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(t => !t.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Name.Contains(search) || 
                                        t.Code.Contains(search) || 
                                        (t.Description != null && t.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(t => t.Category == category);
            }

            return await query.OrderBy(t => t.Name).ToListAsync();
        }

        // GET: api/treatments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Treatment>> GetTreatment(int id)
        {
            var treatment = await _context.Treatments.FindAsync(id);

            if (treatment == null || treatment.IsArchived)
            {
                return NotFound();
            }

            return treatment;
        }

        // POST: api/treatments
        [HttpPost]
        public async Task<ActionResult<Treatment>> CreateTreatment(Treatment treatment)
        {
            treatment.CreatedAt = DateTime.UtcNow;
            treatment.IsArchived = false;

            _context.Treatments.Add(treatment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTreatment), new { id = treatment.Id }, treatment);
        }

        // PUT: api/treatments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTreatment(int id, Treatment treatment)
        {
            if (id != treatment.Id)
            {
                return BadRequest();
            }

            var existingTreatment = await _context.Treatments.FindAsync(id);
            if (existingTreatment == null || existingTreatment.IsArchived)
            {
                return NotFound();
            }

            existingTreatment.Name = treatment.Name;
            existingTreatment.Code = treatment.Code;
            existingTreatment.Category = treatment.Category;
            existingTreatment.Description = treatment.Description;
            existingTreatment.Price = treatment.Price;
            existingTreatment.DurationMinutes = treatment.DurationMinutes;
            existingTreatment.Department = treatment.Department;
            existingTreatment.Prerequisites = treatment.Prerequisites;
            existingTreatment.PostTreatmentInstructions = treatment.PostTreatmentInstructions;
            existingTreatment.RequiresSpecialist = treatment.RequiresSpecialist;
            existingTreatment.IsActive = treatment.IsActive;
            existingTreatment.UpdatedAt = DateTime.UtcNow;
            existingTreatment.UpdatedBy = treatment.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TreatmentExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/treatments/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreatment(int id)
        {
            var treatment = await _context.Treatments.FindAsync(id);
            if (treatment == null || treatment.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            treatment.IsArchived = true;
            treatment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/treatments/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreTreatment(int id)
        {
            var treatment = await _context.Treatments.FindAsync(id);
            if (treatment == null)
            {
                return NotFound();
            }

            treatment.IsArchived = false;
            treatment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/treatments/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetTreatmentCategories()
        {
            var categories = await _context.Treatments
                .Where(t => !t.IsArchived)
                .Select(t => t.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/treatments/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetTreatmentStatistics()
        {
            var stats = new
            {
                TotalTreatments = await _context.Treatments.CountAsync(t => !t.IsArchived),
                ActiveTreatments = await _context.Treatments.CountAsync(t => !t.IsArchived && t.IsActive),
                TreatmentsByCategory = await _context.Treatments
                    .Where(t => !t.IsArchived)
                    .GroupBy(t => t.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToListAsync(),
                AveragePrice = await _context.Treatments
                    .Where(t => !t.IsArchived)
                    .AverageAsync(t => t.Price),
                AverageDuration = await _context.Treatments
                    .Where(t => !t.IsArchived)
                    .AverageAsync(t => t.DurationMinutes)
            };

            return Ok(stats);
        }

        private bool TreatmentExists(int id)
        {
            return _context.Treatments.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
