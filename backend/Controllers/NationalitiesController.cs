using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NationalitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NationalitiesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/nationalities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Nationality>>> GetNationalities([FromQuery] string? region = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.Nationalities.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(n => !n.IsArchived && n.IsActive);
            }

            if (!string.IsNullOrEmpty(region))
            {
                query = query.Where(n => n.Region == region);
            }

            return await query.OrderBy(n => n.SortOrder).ThenBy(n => n.Name).ToListAsync();
        }

        // GET: api/nationalities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Nationality>> GetNationality(int id)
        {
            var nationality = await _context.Nationalities.FindAsync(id);

            if (nationality == null || nationality.IsArchived)
            {
                return NotFound();
            }

            return nationality;
        }

        // POST: api/nationalities
        [HttpPost]
        public async Task<ActionResult<Nationality>> CreateNationality(Nationality nationality)
        {
            nationality.CreatedAt = DateTime.UtcNow;
            nationality.IsArchived = false;

            _context.Nationalities.Add(nationality);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNationality), new { id = nationality.Id }, nationality);
        }

        // PUT: api/nationalities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNationality(int id, Nationality nationality)
        {
            if (id != nationality.Id)
            {
                return BadRequest();
            }

            var existingNationality = await _context.Nationalities.FindAsync(id);
            if (existingNationality == null || existingNationality.IsArchived)
            {
                return NotFound();
            }

            existingNationality.Name = nationality.Name;
            existingNationality.Code = nationality.Code;
            existingNationality.Alpha3Code = nationality.Alpha3Code;
            existingNationality.NumericCode = nationality.NumericCode;
            existingNationality.Region = nationality.Region;
            existingNationality.SubRegion = nationality.SubRegion;
            existingNationality.Currency = nationality.Currency;
            existingNationality.CurrencyCode = nationality.CurrencyCode;
            existingNationality.RequiresVisa = nationality.RequiresVisa;
            existingNationality.IsActive = nationality.IsActive;
            existingNationality.SortOrder = nationality.SortOrder;
            existingNationality.Notes = nationality.Notes;
            existingNationality.UpdatedAt = DateTime.UtcNow;
            existingNationality.UpdatedBy = nationality.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NationalityExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/nationalities/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNationality(int id)
        {
            var nationality = await _context.Nationalities.FindAsync(id);
            if (nationality == null || nationality.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            nationality.IsArchived = true;
            nationality.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/nationalities/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreNationality(int id)
        {
            var nationality = await _context.Nationalities.FindAsync(id);
            if (nationality == null)
            {
                return NotFound();
            }

            nationality.IsArchived = false;
            nationality.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/nationalities/regions
        [HttpGet("regions")]
        public async Task<ActionResult<IEnumerable<string>>> GetRegions()
        {
            var regions = await _context.Nationalities
                .Where(n => !n.IsArchived && !string.IsNullOrEmpty(n.Region))
                .Select(n => n.Region!)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();

            return Ok(regions);
        }

        private bool NationalityExists(int id)
        {
            return _context.Nationalities.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
