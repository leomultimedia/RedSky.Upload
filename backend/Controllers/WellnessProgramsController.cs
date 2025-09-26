using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WellnessProgramsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WellnessProgramsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/wellnessprograms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WellnessProgram>>> GetWellnessPrograms([FromQuery] string? search = null, [FromQuery] string? category = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.WellnessPrograms.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(w => !w.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(w => w.Name.Contains(search) || 
                                        w.Code.Contains(search) || 
                                        (w.Description != null && w.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(w => w.Category == category);
            }

            return await query.OrderBy(w => w.Name).ToListAsync();
        }

        // GET: api/wellnessprograms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WellnessProgram>> GetWellnessProgram(int id)
        {
            var program = await _context.WellnessPrograms.FindAsync(id);

            if (program == null || program.IsArchived)
            {
                return NotFound();
            }

            return program;
        }

        // POST: api/wellnessprograms
        [HttpPost]
        public async Task<ActionResult<WellnessProgram>> CreateWellnessProgram(WellnessProgram program)
        {
            program.CreatedAt = DateTime.UtcNow;
            program.IsArchived = false;

            _context.WellnessPrograms.Add(program);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWellnessProgram), new { id = program.Id }, program);
        }

        // PUT: api/wellnessprograms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWellnessProgram(int id, WellnessProgram program)
        {
            if (id != program.Id)
            {
                return BadRequest();
            }

            var existingProgram = await _context.WellnessPrograms.FindAsync(id);
            if (existingProgram == null || existingProgram.IsArchived)
            {
                return NotFound();
            }

            existingProgram.Name = program.Name;
            existingProgram.Code = program.Code;
            existingProgram.Category = program.Category;
            existingProgram.Description = program.Description;
            existingProgram.Price = program.Price;
            existingProgram.DurationDays = program.DurationDays;
            existingProgram.TargetAgeGroup = program.TargetAgeGroup;
            existingProgram.TargetGender = program.TargetGender;
            existingProgram.Prerequisites = program.Prerequisites;
            existingProgram.Benefits = program.Benefits;
            existingProgram.Inclusions = program.Inclusions;
            existingProgram.MaxParticipants = program.MaxParticipants;
            existingProgram.StartDate = program.StartDate;
            existingProgram.EndDate = program.EndDate;
            existingProgram.InstructorName = program.InstructorName;
            existingProgram.Location = program.Location;
            existingProgram.Schedule = program.Schedule;
            existingProgram.IsActive = program.IsActive;
            existingProgram.Status = program.Status;
            existingProgram.UpdatedAt = DateTime.UtcNow;
            existingProgram.UpdatedBy = program.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WellnessProgramExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/wellnessprograms/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWellnessProgram(int id)
        {
            var program = await _context.WellnessPrograms.FindAsync(id);
            if (program == null || program.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            program.IsArchived = true;
            program.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/wellnessprograms/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreWellnessProgram(int id)
        {
            var program = await _context.WellnessPrograms.FindAsync(id);
            if (program == null)
            {
                return NotFound();
            }

            program.IsArchived = false;
            program.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/wellnessprograms/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetWellnessProgramCategories()
        {
            var categories = await _context.WellnessPrograms
                .Where(w => !w.IsArchived)
                .Select(w => w.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/wellnessprograms/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetWellnessProgramStatistics()
        {
            var stats = new
            {
                TotalPrograms = await _context.WellnessPrograms.CountAsync(w => !w.IsArchived),
                ActivePrograms = await _context.WellnessPrograms.CountAsync(w => !w.IsArchived && w.IsActive),
                ProgramsByCategory = await _context.WellnessPrograms
                    .Where(w => !w.IsArchived)
                    .GroupBy(w => w.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToListAsync(),
                ProgramsByStatus = await _context.WellnessPrograms
                    .Where(w => !w.IsArchived)
                    .GroupBy(w => w.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync(),
                AveragePrice = await _context.WellnessPrograms
                    .Where(w => !w.IsArchived)
                    .AverageAsync(w => w.Price),
                TotalCapacity = await _context.WellnessPrograms
                    .Where(w => !w.IsArchived && w.IsActive)
                    .SumAsync(w => w.MaxParticipants)
            };

            return Ok(stats);
        }

        private bool WellnessProgramExists(int id)
        {
            return _context.WellnessPrograms.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
