using System.ComponentModel.DataAnnotations;

namespace RedSky.Api.Models
{
    public class Department : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public int? ParentDepartmentId { get; set; }
        
        [MaxLength(200)]
        public string? HeadOfDepartment { get; set; }
        
        [MaxLength(100)]
        public string? Location { get; set; }
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(100)]
        public string? Email { get; set; }
        
        public decimal? Budget { get; set; }
        
        public int? StaffCount { get; set; }
        
        [MaxLength(500)]
        public string? Specializations { get; set; }
        
        [MaxLength(500)]
        public string? Equipment { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<Clinician> Clinicians { get; set; } = new List<Clinician>();
    }
}
