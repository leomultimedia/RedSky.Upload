using System.ComponentModel.DataAnnotations;

namespace RedSky.Api.Models
{
    public class Gender : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public int SortOrder { get; set; } = 0;
    }
    
    public class Language : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty; // ISO 639-1 code (en, ar, fr, etc.)
        
        [MaxLength(10)]
        public string? CountryCode { get; set; } // ISO 3166-1 alpha-2 (US, AE, FR, etc.)
        
        [MaxLength(100)]
        public string? NativeName { get; set; }
        
        [MaxLength(10)]
        public string? Direction { get; set; } = "LTR"; // LTR or RTL
        
        public bool IsActive { get; set; } = true;
        
        public bool IsDefault { get; set; } = false;
        
        public int SortOrder { get; set; } = 0;
    }
    
    public class Nationality : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty; // ISO 3166-1 alpha-2 code
        
        [MaxLength(10)]
        public string? Alpha3Code { get; set; } // ISO 3166-1 alpha-3 code
        
        [MaxLength(10)]
        public string? NumericCode { get; set; } // ISO 3166-1 numeric code
        
        [MaxLength(100)]
        public string? Region { get; set; } // Middle East, Europe, Asia, etc.
        
        [MaxLength(100)]
        public string? SubRegion { get; set; }
        
        [MaxLength(100)]
        public string? Currency { get; set; }
        
        [MaxLength(10)]
        public string? CurrencyCode { get; set; }
        
        public bool RequiresVisa { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public int SortOrder { get; set; } = 0;
        
        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
