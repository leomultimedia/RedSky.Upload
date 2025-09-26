using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CliniciansController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CliniciansController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/clinicians
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Clinician>>> GetClinicians(
            [FromQuery] string? search = null, 
            [FromQuery] int? departmentId = null,
            [FromQuery] string? position = null,
            [FromQuery] bool includeArchived = false)
        {
            var query = _context.Clinicians.Include(c => c.Department).AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(c => !c.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.FirstName.Contains(search) || 
                                        c.LastName.Contains(search) ||
                                        c.EmployeeId.Contains(search) ||
                                        (c.Email != null && c.Email.Contains(search)));
            }

            if (departmentId.HasValue)
            {
                query = query.Where(c => c.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrEmpty(position))
            {
                query = query.Where(c => c.Position.Contains(position));
            }

            return await query.OrderBy(c => c.LastName).ThenBy(c => c.FirstName).ToListAsync();
        }

        // GET: api/clinicians/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Clinician>> GetClinician(int id)
        {
            var clinician = await _context.Clinicians
                .Include(c => c.Department)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (clinician == null || clinician.IsArchived)
            {
                return NotFound();
            }

            return clinician;
        }

        // POST: api/clinicians
        [HttpPost]
        public async Task<ActionResult<Clinician>> CreateClinician(Clinician clinician)
        {
            // Check if department exists and is not archived
            var department = await _context.Departments.FindAsync(clinician.DepartmentId);
            if (department == null || department.IsArchived)
            {
                return BadRequest("Invalid or archived department selected.");
            }

            clinician.CreatedAt = DateTime.UtcNow;
            clinician.IsArchived = false;

            _context.Clinicians.Add(clinician);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClinician), new { id = clinician.Id }, clinician);
        }

        // PUT: api/clinicians/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClinician(int id, Clinician clinician)
        {
            if (id != clinician.Id)
            {
                return BadRequest();
            }

            var existingClinician = await _context.Clinicians.FindAsync(id);
            if (existingClinician == null || existingClinician.IsArchived)
            {
                return NotFound();
            }

            // Check if department exists and is not archived
            var department = await _context.Departments.FindAsync(clinician.DepartmentId);
            if (department == null || department.IsArchived)
            {
                return BadRequest("Invalid or archived department selected.");
            }

            existingClinician.FirstName = clinician.FirstName;
            existingClinician.LastName = clinician.LastName;
            existingClinician.EmployeeId = clinician.EmployeeId;
            existingClinician.Email = clinician.Email;
            existingClinician.PhoneNumber = clinician.PhoneNumber;
            existingClinician.Gender = clinician.Gender;
            existingClinician.DateOfBirth = clinician.DateOfBirth;
            existingClinician.Nationality = clinician.Nationality;
            existingClinician.Address = clinician.Address;
            existingClinician.DepartmentId = clinician.DepartmentId;
            existingClinician.Position = clinician.Position;
            existingClinician.Specializations = clinician.Specializations;
            existingClinician.Qualifications = clinician.Qualifications;
            existingClinician.LicenseNumber = clinician.LicenseNumber;
            existingClinician.LicenseExpiryDate = clinician.LicenseExpiryDate;
            existingClinician.JoinDate = clinician.JoinDate;
            existingClinician.TerminationDate = clinician.TerminationDate;
            existingClinician.Salary = clinician.Salary;
            existingClinician.EmploymentStatus = clinician.EmploymentStatus;
            existingClinician.WorkingHours = clinician.WorkingHours;
            existingClinician.AvailabilitySchedule = clinician.AvailabilitySchedule;
            existingClinician.IsActive = clinician.IsActive;
            existingClinician.Notes = clinician.Notes;
            existingClinician.UpdatedAt = DateTime.UtcNow;
            existingClinician.UpdatedBy = clinician.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClinicianExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/clinicians/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClinician(int id)
        {
            var clinician = await _context.Clinicians.FindAsync(id);
            if (clinician == null || clinician.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            clinician.IsArchived = true;
            clinician.EmploymentStatus = "Terminated";
            clinician.TerminationDate = DateTime.UtcNow;
            clinician.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/clinicians/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreClinician(int id)
        {
            var clinician = await _context.Clinicians.FindAsync(id);
            if (clinician == null)
            {
                return NotFound();
            }

            clinician.IsArchived = false;
            clinician.EmploymentStatus = "Active";
            clinician.TerminationDate = null;
            clinician.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/clinicians/positions
        [HttpGet("positions")]
        public async Task<ActionResult<IEnumerable<string>>> GetPositions()
        {
            var positions = await _context.Clinicians
                .Where(c => !c.IsArchived)
                .Select(c => c.Position)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();

            return Ok(positions);
        }

        // GET: api/clinicians/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetClinicianStatistics()
        {
            var stats = new
            {
                TotalClinicians = await _context.Clinicians.CountAsync(c => !c.IsArchived),
                ActiveClinicians = await _context.Clinicians.CountAsync(c => !c.IsArchived && c.IsActive),
                CliniciansByPosition = await _context.Clinicians
                    .Where(c => !c.IsArchived)
                    .GroupBy(c => c.Position)
                    .Select(g => new { Position = g.Key, Count = g.Count() })
                    .ToListAsync(),
                CliniciansByDepartment = await _context.Clinicians
                    .Where(c => !c.IsArchived)
                    .Include(c => c.Department)
                    .GroupBy(c => c.Department!.Name)
                    .Select(g => new { Department = g.Key, Count = g.Count() })
                    .ToListAsync(),
                AverageSalary = await _context.Clinicians
                    .Where(c => !c.IsArchived && c.Salary.HasValue)
                    .AverageAsync(c => c.Salary!.Value)
            };

            return Ok(stats);
        }

        private bool ClinicianExists(int id)
        {
            return _context.Clinicians.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
