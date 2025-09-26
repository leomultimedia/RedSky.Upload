using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GendersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GendersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/genders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gender>>> GetGenders([FromQuery] bool includeArchived = false)
        {
            var query = _context.Genders.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(g => !g.IsArchived && g.IsActive);
            }

            return await query.OrderBy(g => g.SortOrder).ThenBy(g => g.Name).ToListAsync();
        }

        // GET: api/genders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Gender>> GetGender(int id)
        {
            var gender = await _context.Genders.FindAsync(id);

            if (gender == null || gender.IsArchived)
            {
                return NotFound();
            }

            return gender;
        }

        // POST: api/genders
        [HttpPost]
        public async Task<ActionResult<Gender>> CreateGender(Gender gender)
        {
            gender.CreatedAt = DateTime.UtcNow;
            gender.IsArchived = false;

            _context.Genders.Add(gender);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGender), new { id = gender.Id }, gender);
        }

        // PUT: api/genders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGender(int id, Gender gender)
        {
            if (id != gender.Id)
            {
                return BadRequest();
            }

            var existingGender = await _context.Genders.FindAsync(id);
            if (existingGender == null || existingGender.IsArchived)
            {
                return NotFound();
            }

            existingGender.Name = gender.Name;
            existingGender.Code = gender.Code;
            existingGender.Description = gender.Description;
            existingGender.IsActive = gender.IsActive;
            existingGender.SortOrder = gender.SortOrder;
            existingGender.UpdatedAt = DateTime.UtcNow;
            existingGender.UpdatedBy = gender.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GenderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/genders/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGender(int id)
        {
            var gender = await _context.Genders.FindAsync(id);
            if (gender == null || gender.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            gender.IsArchived = true;
            gender.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/genders/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreGender(int id)
        {
            var gender = await _context.Genders.FindAsync(id);
            if (gender == null)
            {
                return NotFound();
            }

            gender.IsArchived = false;
            gender.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GenderExists(int id)
        {
            return _context.Genders.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
