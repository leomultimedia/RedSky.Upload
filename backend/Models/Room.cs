using System.ComponentModel.DataAnnotations;

namespace RedSky.Api.Models
{
    public class Room : BaseEntity
    {
        [Required]
        [MaxLength(20)]
        public string RoomNumber { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string RoomType { get; set; } = string.Empty; // Private, Semi-Private, Ward, ICU, Emergency
        
        [Required]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;
        
        public int Capacity { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance
        
        public int Floor { get; set; }
        
        [MaxLength(500)]
        public string? Amenities { get; set; } // JSON string of amenities
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public decimal? DailyRate { get; set; }
    }
}
