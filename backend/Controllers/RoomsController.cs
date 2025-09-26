using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms([FromQuery] string? search = null, [FromQuery] bool includeArchived = false)
        {
            var query = _context.Rooms.AsQueryable();

            if (!includeArchived)
            {
                query = query.Where(r => !r.IsArchived);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(r => r.RoomNumber.Contains(search) || 
                                        r.RoomType.Contains(search) || 
                                        r.Department.Contains(search));
            }

            return await query.OrderBy(r => r.RoomNumber).ToListAsync();
        }

        // GET: api/rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);

            if (room == null || room.IsArchived)
            {
                return NotFound();
            }

            return room;
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<ActionResult<Room>> CreateRoom(Room room)
        {
            room.CreatedAt = DateTime.UtcNow;
            room.IsArchived = false;

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room);
        }

        // PUT: api/rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, Room room)
        {
            if (id != room.Id)
            {
                return BadRequest();
            }

            var existingRoom = await _context.Rooms.FindAsync(id);
            if (existingRoom == null || existingRoom.IsArchived)
            {
                return NotFound();
            }

            existingRoom.RoomNumber = room.RoomNumber;
            existingRoom.RoomType = room.RoomType;
            existingRoom.Department = room.Department;
            existingRoom.Capacity = room.Capacity;
            existingRoom.Status = room.Status;
            existingRoom.Floor = room.Floor;
            existingRoom.Amenities = room.Amenities;
            existingRoom.Description = room.Description;
            existingRoom.DailyRate = room.DailyRate;
            existingRoom.UpdatedAt = DateTime.UtcNow;
            existingRoom.UpdatedBy = room.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/rooms/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null || room.IsArchived)
            {
                return NotFound();
            }

            // Soft delete
            room.IsArchived = true;
            room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/rooms/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            room.IsArchived = false;
            room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/rooms/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetRoomStatistics()
        {
            var stats = new
            {
                TotalRooms = await _context.Rooms.CountAsync(r => !r.IsArchived),
                AvailableRooms = await _context.Rooms.CountAsync(r => !r.IsArchived && r.Status == "Available"),
                OccupiedRooms = await _context.Rooms.CountAsync(r => !r.IsArchived && r.Status == "Occupied"),
                MaintenanceRooms = await _context.Rooms.CountAsync(r => !r.IsArchived && r.Status == "Maintenance"),
                RoomsByType = await _context.Rooms
                    .Where(r => !r.IsArchived)
                    .GroupBy(r => r.RoomType)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToListAsync(),
                RoomsByDepartment = await _context.Rooms
                    .Where(r => !r.IsArchived)
                    .GroupBy(r => r.Department)
                    .Select(g => new { Department = g.Key, Count = g.Count() })
                    .ToListAsync()
            };

            return Ok(stats);
        }

        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(e => e.Id == id && !e.IsArchived);
        }
    }
}
