using System.ComponentModel.DataAnnotations;

namespace RedSky.Api.Models
{
    public class Treatment : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public decimal Price { get; set; }
        
        public int DurationMinutes { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        [MaxLength(500)]
        public string? Prerequisites { get; set; }
        
        [MaxLength(500)]
        public string? PostTreatmentInstructions { get; set; }
        
        public bool RequiresSpecialist { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
    }
}
