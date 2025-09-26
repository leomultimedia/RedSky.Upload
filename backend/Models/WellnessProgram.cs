using System.ComponentModel.DataAnnotations;

namespace RedSky.Api.Models
{
    public class WellnessProgram : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; // Fitness, Nutrition, Mental Health, Preventive Care
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public decimal Price { get; set; }
        
        public int DurationDays { get; set; }
        
        [MaxLength(100)]
        public string? TargetAgeGroup { get; set; }
        
        [MaxLength(100)]
        public string? TargetGender { get; set; }
        
        [MaxLength(500)]
        public string? Prerequisites { get; set; }
        
        [MaxLength(500)]
        public string? Benefits { get; set; }
        
        [MaxLength(500)]
        public string? Inclusions { get; set; }
        
        public int MaxParticipants { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [MaxLength(200)]
        public string? InstructorName { get; set; }
        
        [MaxLength(100)]
        public string? Location { get; set; }
        
        [MaxLength(50)]
        public string Schedule { get; set; } = string.Empty; // Daily, Weekly, Monthly
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Active, Completed, Cancelled
    }
}
