using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepartmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments([FromQuery] string? search = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.Departments.Include(d => d.Clinicians).AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(d => !d.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => d.Name.Contains(search) || 
                                        d.Code.Contains(search) || 
                                        (d.Description != null && d.Description.Contains(search)));
            }

            return await query.OrderBy(d => d.Name).ToListAsync();
        }

        // GET: api/departments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(int id)
        {
            var department = await _context.Departments
                .Include(d => d.Clinicians.Where(c => !c.IsArchived))
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null || department.IsArchived)
            {
                return NotFound();
            }

            return department;
        }

        // POST: api/departments
        [HttpPost]
        public async Task<ActionResult<Department>> CreateDepartment(Department department)
        {
            department.CreatedAt = DateTime.UtcNow;
            department.IsArchived = false;

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }

        // PUT: api/departments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, Department department)
        {
            if (id != department.Id)
            {
                return BadRequest();
            }

            var existingDepartment = await _context.Departments.FindAsync(id);
            if (existingDepartment == null || existingDepartment.IsArchived)
            {
                return NotFound();
            }

            existingDepartment.Name = department.Name;
            existingDepartment.Code = department.Code;
            existingDepartment.Description = department.Description;
            existingDepartment.ParentDepartmentId = department.ParentDepartmentId;
            existingDepartment.HeadOfDepartment = department.HeadOfDepartment;
            existingDepartment.Location = department.Location;
            existingDepartment.PhoneNumber = department.PhoneNumber;
            existingDepartment.Email = department.Email;
            existingDepartment.Budget = department.Budget;
            existingDepartment.StaffCount = department.StaffCount;
            existingDepartment.Specializations = department.Specializations;
            existingDepartment.Equipment = department.Equipment;
            existingDepartment.IsActive = department.IsActive;
            existingDepartment.UpdatedAt = DateTime.UtcNow;
            existingDepartment.UpdatedBy = department.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/departments/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null || department.IsArchived)
            {
                return NotFound();
            }

            // Check if department has active clinicians
            var hasActiveClinicians = await _context.Clinicians
                .AnyAsync(c => c.DepartmentId == id && !c.IsArchived);

            if (hasActiveClinicians)
            {
                return BadRequest("Cannot archive department with active clinicians. Please reassign or archive clinicians first.");
            }

            // Soft delete
            department.IsArchived = true;
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/departments/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            department.IsArchived = false;
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/departments/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetDepartmentStatistics()
        {
            var stats = new
            {
                TotalDepartments = await _context.Departments.CountAsync(d => !d.IsArchived),
                ActiveDepartments = await _context.Departments.CountAsync(d => !d.IsArchived && d.IsActive),
                TotalClinicians = await _context.Clinicians.CountAsync(c => !c.IsArchived),
                DepartmentsByStaffCount = await _context.Departments
                    .Where(d => !d.IsArchived)
                    .Select(d => new { 
                        Name = d.Name, 
                        StaffCount = d.Clinicians.Count(c => !c.IsArchived),
                        Budget = d.Budget 
                    })
                    .OrderByDescending(d => d.StaffCount)
                    .ToListAsync()
            };

            return Ok(stats);
        }

        private bool DepartmentExists(int id)
        {
            return _context.Departments.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
