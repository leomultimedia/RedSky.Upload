using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedSky.Api.Services;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly ExcelImportService _importService;
        public UploadController(ExcelImportService importService)
        {
            _importService = importService;
        }

        [HttpPost]
        [RequestSizeLimit(100_000_000)] // ~100 MB
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File is required");
            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) && 
                !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase) && 
                !file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only Excel files (.xlsx, .xls) and CSV files (.csv) are allowed");
            }
            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _importService.ImportAsync(stream, HttpContext.RequestAborted);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Import failed", error = ex.Message });
            }
        }
    }
}


