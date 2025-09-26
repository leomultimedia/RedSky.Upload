using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class TreatmentPlan : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public int PatientId { get; set; }
        
        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }
        
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Active, Completed, Cancelled
        
        public decimal TotalCost { get; set; }
        
        [MaxLength(100)]
        public string? AssignedDoctorId { get; set; }
        
        [MaxLength(200)]
        public string? AssignedDoctorName { get; set; }
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        public int Priority { get; set; } = 1; // 1=Low, 2=Medium, 3=High, 4=Critical
        
        // Navigation property for treatment plan items
        public ICollection<TreatmentPlanItem> TreatmentPlanItems { get; set; } = new List<TreatmentPlanItem>();
    }
    
    public class TreatmentPlanItem : BaseEntity
    {
        public int TreatmentPlanId { get; set; }
        
        [ForeignKey(nameof(TreatmentPlanId))]
        public TreatmentPlan? TreatmentPlan { get; set; }
        
        public int TreatmentId { get; set; }
        
        [ForeignKey(nameof(TreatmentId))]
        public Treatment? Treatment { get; set; }
        
        public int Sequence { get; set; }
        
        public DateTime ScheduledDate { get; set; }
        
        public DateTime? CompletedDate { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled
        
        [MaxLength(500)]
        public string? Notes { get; set; }
        
        public decimal Cost { get; set; }
    }
}
