using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TherapistsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TherapistsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/therapists
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Therapist>>> GetTherapists(
            [FromQuery] string? search = null, 
            [FromQuery] int? departmentId = null,
            [FromQuery] string? therapyType = null,
            [FromQuery] bool includeArchived = false)
        {
            var query = _context.Therapists.Include(t => t.Department).AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(t => !t.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.FirstName.Contains(search) || 
                                        t.LastName.Contains(search) ||
                                        t.EmployeeId.Contains(search) ||
                                        (t.Email != null && t.Email.Contains(search)));
            }

            if (departmentId.HasValue)
            {
                query = query.Where(t => t.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrEmpty(therapyType))
            {
                query = query.Where(t => t.TherapyType.Contains(therapyType));
            }

            return await query.OrderBy(t => t.LastName).ThenBy(t => t.FirstName).ToListAsync();
        }

        // GET: api/therapists/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Therapist>> GetTherapist(int id)
        {
            var therapist = await _context.Therapists
                .Include(t => t.Department)
                .Include(t => t.TherapySessions)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (therapist == null || therapist.IsArchived)
            {
                return NotFound();
            }

            return therapist;
        }

        // POST: api/therapists
        [HttpPost]
        public async Task<ActionResult<Therapist>> CreateTherapist(Therapist therapist)
        {
            // Check if department exists and is not archived
            var department = await _context.Departments.FindAsync(therapist.DepartmentId);
            if (department == null || department.IsArchived)
            {
                return BadRequest("Invalid or archived department selected.");
            }

            therapist.CreatedAt = DateTime.UtcNow;
            therapist.IsArchived = false;

            _context.Therapists.Add(therapist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTherapist), new { id = therapist.Id }, therapist);
        }

        // PUT: api/therapists/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTherapist(int id, Therapist therapist)
        {
            if (id != therapist.Id)
            {
                return BadRequest();
            }

            var existingTherapist = await _context.Therapists.FindAsync(id);
            if (existingTherapist == null || existingTherapist.IsArchived)
            {
                return NotFound();
            }

            // Check if department exists and is not archived
            var department = await _context.Departments.FindAsync(therapist.DepartmentId);
            if (department == null || department.IsArchived)
            {
                return BadRequest("Invalid or archived department selected.");
            }

            existingTherapist.FirstName = therapist.FirstName;
            existingTherapist.LastName = therapist.LastName;
            existingTherapist.EmployeeId = therapist.EmployeeId;
            existingTherapist.Email = therapist.Email;
            existingTherapist.PhoneNumber = therapist.PhoneNumber;
            existingTherapist.Gender = therapist.Gender;
            existingTherapist.DateOfBirth = therapist.DateOfBirth;
            existingTherapist.Nationality = therapist.Nationality;
            existingTherapist.Address = therapist.Address;
            existingTherapist.DepartmentId = therapist.DepartmentId;
            existingTherapist.TherapyType = therapist.TherapyType;
            existingTherapist.Specializations = therapist.Specializations;
            existingTherapist.Certifications = therapist.Certifications;
            existingTherapist.LicenseNumber = therapist.LicenseNumber;
            existingTherapist.LicenseExpiryDate = therapist.LicenseExpiryDate;
            existingTherapist.JoinDate = therapist.JoinDate;
            existingTherapist.TerminationDate = therapist.TerminationDate;
            existingTherapist.HourlyRate = therapist.HourlyRate;
            existingTherapist.EmploymentStatus = therapist.EmploymentStatus;
            existingTherapist.WorkingHours = therapist.WorkingHours;
            existingTherapist.AvailabilitySchedule = therapist.AvailabilitySchedule;
            existingTherapist.MaxPatientsPerDay = therapist.MaxPatientsPerDay;
            existingTherapist.SessionDurationMinutes = therapist.SessionDurationMinutes;
            existingTherapist.IsActive = therapist.IsActive;
            existingTherapist.Notes = therapist.Notes;
            existingTherapist.UpdatedAt = DateTime.UtcNow;
            existingTherapist.UpdatedBy = therapist.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TherapistExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/therapists/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTherapist(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null || therapist.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            therapist.IsArchived = true;
            therapist.EmploymentStatus = "Terminated";
            therapist.TerminationDate = DateTime.UtcNow;
            therapist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/therapists/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreTherapist(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null)
            {
                return NotFound();
            }

            therapist.IsArchived = false;
            therapist.EmploymentStatus = "Active";
            therapist.TerminationDate = null;
            therapist.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/therapists/therapy-types
        [HttpGet("therapy-types")]
        public async Task<ActionResult<IEnumerable<string>>> GetTherapyTypes()
        {
            var therapyTypes = await _context.Therapists
                .Where(t => !t.IsArchived)
                .Select(t => t.TherapyType)
                .Distinct()
                .OrderBy(tt => tt)
                .ToListAsync();

            return Ok(therapyTypes);
        }

        // GET: api/therapists/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetTherapistStatistics()
        {
            var stats = new
            {
                TotalTherapists = await _context.Therapists.CountAsync(t => !t.IsArchived),
                ActiveTherapists = await _context.Therapists.CountAsync(t => !t.IsArchived && t.IsActive),
                TherapistsByType = await _context.Therapists
                    .Where(t => !t.IsArchived)
                    .GroupBy(t => t.TherapyType)
                    .Select(g => new { TherapyType = g.Key, Count = g.Count() })
                    .ToListAsync(),
                TherapistsByDepartment = await _context.Therapists
                    .Where(t => !t.IsArchived)
                    .Include(t => t.Department)
                    .GroupBy(t => t.Department!.Name)
                    .Select(g => new { Department = g.Key, Count = g.Count() })
                    .ToListAsync(),
                AverageHourlyRate = await _context.Therapists
                    .Where(t => !t.IsArchived && t.HourlyRate.HasValue)
                    .AverageAsync(t => t.HourlyRate!.Value),
                TotalCapacity = await _context.Therapists
                    .Where(t => !t.IsArchived && t.IsActive)
                    .SumAsync(t => t.MaxPatientsPerDay)
            };

            return Ok(stats);
        }

        private bool TherapistExists(int id)
        {
            return _context.Therapists.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
