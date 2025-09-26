using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class Clinician : BaseEntity
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
        public string Position { get; set; } = string.Empty; // Doctor, Nurse, Technician, etc.
        
        [MaxLength(500)]
        public string? Specializations { get; set; }
        
        [MaxLength(500)]
        public string? Qualifications { get; set; }
        
        [MaxLength(100)]
        public string? LicenseNumber { get; set; }
        
        public DateTime? LicenseExpiryDate { get; set; }
        
        public DateTime JoinDate { get; set; }
        
        public DateTime? TerminationDate { get; set; }
        
        public decimal? Salary { get; set; }
        
        [MaxLength(50)]
        public string EmploymentStatus { get; set; } = "Active"; // Active, Inactive, Terminated
        
        [MaxLength(500)]
        public string? WorkingHours { get; set; }
        
        [MaxLength(500)]
        public string? AvailabilitySchedule { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
