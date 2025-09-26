using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class Therapist : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string EmployeeId { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Email { get; set; }
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(10)]
        public string? Gender { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(100)]
        public string? Nationality { get; set; }
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        public int DepartmentId { get; set; }
        
        [ForeignKey(nameof(DepartmentId))]
        public Department? Department { get; set; }
        
        [MaxLength(100)]
        public string TherapyType { get; set; } = string.Empty; // Physical, Occupational, Speech, Mental Health
        
        [MaxLength(500)]
        public string? Specializations { get; set; }
        
        [MaxLength(500)]
        public string? Certifications { get; set; }
        
        [MaxLength(100)]
        public string? LicenseNumber { get; set; }
        
        public DateTime? LicenseExpiryDate { get; set; }
        
        public DateTime JoinDate { get; set; }
        
        public DateTime? TerminationDate { get; set; }
        
        public decimal? HourlyRate { get; set; }
        
        [MaxLength(50)]
        public string EmploymentStatus { get; set; } = "Active"; // Active, Inactive, Terminated
        
        [MaxLength(500)]
        public string? WorkingHours { get; set; }
        
        [MaxLength(500)]
        public string? AvailabilitySchedule { get; set; }
        
        public int MaxPatientsPerDay { get; set; } = 8;
        
        public int SessionDurationMinutes { get; set; } = 60;
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        // Navigation properties
        public ICollection<TherapySession> TherapySessions { get; set; } = new List<TherapySession>();
    }
    
    public class TherapySession : BaseEntity
    {
        public int TherapistId { get; set; }
        
        [ForeignKey(nameof(TherapistId))]
        public Therapist? Therapist { get; set; }
        
        public int PatientId { get; set; }
        
        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }
        
        public DateTime SessionDate { get; set; }
        
        public TimeSpan StartTime { get; set; }
        
        public TimeSpan EndTime { get; set; }
        
        [MaxLength(100)]
        public string SessionType { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled
        
        [MaxLength(1000)]
        public string? SessionNotes { get; set; }
        
        [MaxLength(1000)]
        public string? TreatmentPlan { get; set; }
        
        [MaxLength(1000)]
        public string? ProgressNotes { get; set; }
        
        public decimal SessionFee { get; set; }
        
        public int? RoomId { get; set; }
        
        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }
    }
}
