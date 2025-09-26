using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LanguagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LanguagesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/languages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Language>>> GetLanguages([FromQuery] bool includeArchived = false)
        {
            var query = _context.Languages.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(l => !l.IsArchived && l.IsActive);
            }

            return await query.OrderBy(l => l.SortOrder).ThenBy(l => l.Name).ToListAsync();
        }

        // GET: api/languages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Language>> GetLanguage(int id)
        {
            var language = await _context.Languages.FindAsync(id);

            if (language == null || language.IsArchived)
            {
                return NotFound();
            }

            return language;
        }

        // POST: api/languages
        [HttpPost]
        public async Task<ActionResult<Language>> CreateLanguage(Language language)
        {
            language.CreatedAt = DateTime.UtcNow;
            language.IsArchived = false;

            _context.Languages.Add(language);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLanguage), new { id = language.Id }, language);
        }

        // PUT: api/languages/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLanguage(int id, Language language)
        {
            if (id != language.Id)
            {
                return BadRequest();
            }

            var existingLanguage = await _context.Languages.FindAsync(id);
            if (existingLanguage == null || existingLanguage.IsArchived)
            {
                return NotFound();
            }

            existingLanguage.Name = language.Name;
            existingLanguage.Code = language.Code;
            existingLanguage.CountryCode = language.CountryCode;
            existingLanguage.NativeName = language.NativeName;
            existingLanguage.Direction = language.Direction;
            existingLanguage.IsActive = language.IsActive;
            existingLanguage.IsDefault = language.IsDefault;
            existingLanguage.SortOrder = language.SortOrder;
            existingLanguage.UpdatedAt = DateTime.UtcNow;
            existingLanguage.UpdatedBy = language.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LanguageExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/languages/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLanguage(int id)
        {
            var language = await _context.Languages.FindAsync(id);
            if (language == null || language.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            language.IsArchived = true;
            language.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/languages/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreLanguage(int id)
        {
            var language = await _context.Languages.FindAsync(id);
            if (language == null)
            {
                return NotFound();
            }

            language.IsArchived = false;
            language.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LanguageExists(int id)
        {
            return _context.Languages.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
