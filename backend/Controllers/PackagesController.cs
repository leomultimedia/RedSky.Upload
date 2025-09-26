using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PackagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PackagesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/packages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Package>>> GetPackages([FromQuery] string? search = null, [FromQuery] string? category = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.Packages.Include(p => p.PackageItems).ThenInclude(pi => pi.Treatment).AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(p => !p.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || 
                                        p.Code.Contains(search) || 
                                        (p.Description != null && p.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            return await query.OrderBy(p => p.Name).ToListAsync();
        }

        // GET: api/packages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Package>> GetPackage(int id)
        {
            var package = await _context.Packages
                .Include(p => p.PackageItems)
                .ThenInclude(pi => pi.Treatment)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null || package.IsArchived)
            {
                return NotFound();
            }

            return package;
        }

        // POST: api/packages
        [HttpPost]
        public async Task<ActionResult<Package>> CreatePackage(Package package)
        {
            package.CreatedAt = DateTime.UtcNow;
            package.IsArchived = false;

            _context.Packages.Add(package);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPackage), new { id = package.Id }, package);
        }

        // PUT: api/packages/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(int id, Package package)
        {
            if (id != package.Id)
            {
                return BadRequest();
            }

            var existingPackage = await _context.Packages.FindAsync(id);
            if (existingPackage == null || existingPackage.IsArchived)
            {
                return NotFound();
            }

            existingPackage.Name = package.Name;
            existingPackage.Code = package.Code;
            existingPackage.Category = package.Category;
            existingPackage.Description = package.Description;
            existingPackage.OriginalPrice = package.OriginalPrice;
            existingPackage.PackagePrice = package.PackagePrice;
            existingPackage.DiscountPercentage = package.DiscountPercentage;
            existingPackage.ValidityDays = package.ValidityDays;
            existingPackage.ValidFrom = package.ValidFrom;
            existingPackage.ValidTo = package.ValidTo;
            existingPackage.Department = package.Department;
            existingPackage.MaxUsage = package.MaxUsage;
            existingPackage.IsActive = package.IsActive;
            existingPackage.Terms = package.Terms;
            existingPackage.Inclusions = package.Inclusions;
            existingPackage.Exclusions = package.Exclusions;
            existingPackage.UpdatedAt = DateTime.UtcNow;
            existingPackage.UpdatedBy = package.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PackageExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/packages/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package == null || package.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            package.IsArchived = true;
            package.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/packages/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestorePackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package == null)
            {
                return NotFound();
            }

            package.IsArchived = false;
            package.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/packages/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetPackageCategories()
        {
            var categories = await _context.Packages
                .Where(p => !p.IsArchived)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/packages/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetPackageStatistics()
        {
            var stats = new
            {
                TotalPackages = await _context.Packages.CountAsync(p => !p.IsArchived),
                ActivePackages = await _context.Packages.CountAsync(p => !p.IsArchived && p.IsActive),
                PackagesByCategory = await _context.Packages
                    .Where(p => !p.IsArchived)
                    .GroupBy(p => p.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToListAsync(),
                AverageDiscount = await _context.Packages
                    .Where(p => !p.IsArchived)
                    .AverageAsync(p => p.DiscountPercentage),
                TotalSavings = await _context.Packages
                    .Where(p => !p.IsArchived)
                    .SumAsync(p => p.OriginalPrice - p.PackagePrice)
            };

            return Ok(stats);
        }

        private bool PackageExists(int id)
        {
            return _context.Packages.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
