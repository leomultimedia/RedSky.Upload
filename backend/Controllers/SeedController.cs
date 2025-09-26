using Microsoft.AspNetCore.Mvc;
using RedSky.Api.Services;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/seed")]
    public class SeedController : ControllerBase
    {
        private readonly DataSeedService _seedService;

        public SeedController(DataSeedService seedService)
        {
            _seedService = seedService;
        }

        [HttpPost("test-data")]
        public async Task<IActionResult> GenerateTestData(
            [FromQuery] int patients = 100,
            [FromQuery] int visits = 5)
        {
            await _seedService.SeedTestData(patients, visits);
            return Ok($"Generated {patients} patients with up to {visits} visits each");
        }
    }
}
