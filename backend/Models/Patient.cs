using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RedSky.Api.Models
{
    public class Patient : BaseEntity
    {

        [Required]
        [MaxLength(64)]
        public string EmrNo { get; set; } = string.Empty;

        [MaxLength(128)]
        public string? Name { get; set; }

        public int? Age { get; set; }

        [MaxLength(64)]
        public string? Nationality { get; set; }

        [MaxLength(64)]
        public string? InsuranceType { get; set; }

        [MaxLength(128)]
        public string? InsuranceCompany { get; set; }

        [MaxLength(64)]
        public string? InsurancePlan { get; set; }

        [MaxLength(64)]
        public string? InsuranceGroup { get; set; }

        [MaxLength(64)]
        public string? EmiratesId { get; set; }

        [MaxLength(64)]
        public string? MemberId { get; set; }

        public List<Visit> Visits { get; set; } = new();
    }
}


