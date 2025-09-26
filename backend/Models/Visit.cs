using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class Visit : BaseEntity
    {

        [Required]
        [MaxLength(64)]
        public string VisitNo { get; set; } = string.Empty;

        public DateTime? VisitDate { get; set; }

        [MaxLength(128)]
        public string? Department { get; set; }

        [MaxLength(128)]
        public string? Doctor { get; set; }

        [MaxLength(32)]
        public string? EncType { get; set; }

        public decimal? VatAmount { get; set; }

        public int PatientId { get; set; }

        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }

        // Billing/claim optional fields
        [MaxLength(64)]
        public string? BillNo { get; set; }

        [MaxLength(64)]
        public string? ClaimUniqueId { get; set; }
    }
}


