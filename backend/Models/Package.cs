using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class Package : BaseEntity
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
        
        public decimal OriginalPrice { get; set; }
        
        public decimal PackagePrice { get; set; }
        
        public decimal DiscountPercentage { get; set; }
        
        public int ValidityDays { get; set; }
        
        public DateTime? ValidFrom { get; set; }
        
        public DateTime? ValidTo { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        public int MaxUsage { get; set; } = 1;
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(500)]
        public string? Terms { get; set; }
        
        [MaxLength(500)]
        public string? Inclusions { get; set; }
        
        [MaxLength(500)]
        public string? Exclusions { get; set; }
        
        // Navigation property for package items
        public ICollection<PackageItem> PackageItems { get; set; } = new List<PackageItem>();
    }
    
    public class PackageItem : BaseEntity
    {
        public int PackageId { get; set; }
        
        [ForeignKey(nameof(PackageId))]
        public Package? Package { get; set; }
        
        public int TreatmentId { get; set; }
        
        [ForeignKey(nameof(TreatmentId))]
        public Treatment? Treatment { get; set; }
        
        public int Quantity { get; set; } = 1;
        
        public decimal UnitPrice { get; set; }
        
        public decimal TotalPrice { get; set; }
        
        public bool IsOptional { get; set; } = false;
    }
}
