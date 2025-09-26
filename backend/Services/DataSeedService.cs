using RedSky.Api.Models;
using RedSky.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace RedSky.Api.Services
{
    public class DataSeedService
    {
        private readonly AppDbContext _context;
        private readonly Random _random = new();

        public DataSeedService(AppDbContext context)
        {
            _context = context;
        }

        public async Task SeedTestData(int patientCount = 100, int visitsPerPatient = 5)
        {
            if (await _context.Patients.AnyAsync())
                return; // Already seeded

            // Create Patients and Visits using existing model structure
            var patients = new List<Patient>();
            for (int i = 1; i <= patientCount; i++)
            {
                var patient = new Patient
                {
                    EmrNo = $"EMR{i:D6}",
                    Name = $"Patient {i} Demo",
                    Age = _random.Next(18, 80),
                    Nationality = _random.Next(3) switch
                    {
                        0 => "UAE",
                        1 => "Indian",
                        _ => "Pakistani"
                    },
                    InsuranceType = _random.Next(2) == 0 ? "Medical" : "Dental",
                    InsuranceCompany = "Demo Insurance Co.",
                    EmiratesId = $"784-{_random.Next(1000, 9999)}-{_random.Next(1000000, 9999999)}-{_random.Next(1, 9)}"
                };

                // Add visits
                for (int j = 0; j < _random.Next(1, visitsPerPatient); j++)
                {
                    patient.Visits.Add(new Visit
                    {
                        VisitNo = $"V{i:D4}{j:D2}",
                        VisitDate = DateTime.Now.AddDays(-_random.Next(365)),
                        Department = _random.Next(3) switch
                        {
                            0 => "Cardiology",
                            1 => "Neurology",
                            _ => "Orthopedics"
                        },
                        Doctor = $"Dr. Smith {_random.Next(1, 10)}",
                        EncType = _random.Next(2) == 0 ? "OPD" : "IPD",
                        VatAmount = (decimal)(_random.NextDouble() * 100)
                    });
                }

                patients.Add(patient);
            }
            await _context.Patients.AddRangeAsync(patients);

            await _context.SaveChangesAsync();
        }
    }
}