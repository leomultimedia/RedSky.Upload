using Microsoft.AspNetCore.Mvc;
using RedSky.Api.Services;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MasterDataController : ControllerBase
    {
        private readonly MasterDataSeedService _seedService;

        public MasterDataController(MasterDataSeedService seedService)
        {
            _seedService = seedService;
        }

        // POST: api/masterdata/seed
        [HttpPost("seed")]
        public async Task<ActionResult> SeedMasterData()
        {
            try
            {
                await _seedService.SeedAllMasterDataAsync();
                return Ok(new { message = "Master data seeded successfully", timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed master data", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/genders
        [HttpPost("seed/genders")]
        public async Task<ActionResult> SeedGenders()
        {
            try
            {
                await _seedService.SeedGendersAsync();
                return Ok(new { message = "Genders seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed genders", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/languages
        [HttpPost("seed/languages")]
        public async Task<ActionResult> SeedLanguages()
        {
            try
            {
                await _seedService.SeedLanguagesAsync();
                return Ok(new { message = "Languages seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed languages", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/nationalities
        [HttpPost("seed/nationalities")]
        public async Task<ActionResult> SeedNationalities()
        {
            try
            {
                await _seedService.SeedNationalitiesAsync();
                return Ok(new { message = "Nationalities seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed nationalities", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/departments
        [HttpPost("seed/departments")]
        public async Task<ActionResult> SeedDepartments()
        {
            try
            {
                await _seedService.SeedDepartmentsAsync();
                return Ok(new { message = "Departments seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed departments", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/rooms
        [HttpPost("seed/rooms")]
        public async Task<ActionResult> SeedRooms()
        {
            try
            {
                await _seedService.SeedRoomsAsync();
                return Ok(new { message = "Rooms seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed rooms", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/treatments
        [HttpPost("seed/treatments")]
        public async Task<ActionResult> SeedTreatments()
        {
            try
            {
                await _seedService.SeedTreatmentsAsync();
                return Ok(new { message = "Treatments seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed treatments", error = ex.Message });
            }
        }

        // POST: api/masterdata/seed/clinicians
        [HttpPost("seed/clinicians")]
        public async Task<ActionResult> SeedClinicians()
        {
            try
            {
                await _seedService.SeedCliniciansAsync();
                return Ok(new { message = "Clinicians seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to seed clinicians", error = ex.Message });
            }
        }
    }
}
