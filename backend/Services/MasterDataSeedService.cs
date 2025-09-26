using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Services
{
    public class MasterDataSeedService
    {
        private readonly AppDbContext _context;

        public MasterDataSeedService(AppDbContext context)
        {
            _context = context;
        }

        public async Task SeedAllMasterDataAsync()
        {
            await SeedGendersAsync();
            await SeedLanguagesAsync();
            await SeedNationalitiesAsync();
            await SeedDepartmentsAsync();
            await SeedRoomsAsync();
            await SeedTreatmentsAsync();
            await SeedCliniciansAsync();
            await SeedWellnessProgramsAsync();
            await SeedPackagesAsync();
        }

        public async Task SeedGendersAsync()
        {
            if (!await _context.Genders.AnyAsync())
            {
                var genders = new[]
                {
                    new Gender { Name = "Male", Code = "M", SortOrder = 1, IsActive = true },
                    new Gender { Name = "Female", Code = "F", SortOrder = 2, IsActive = true },
                    new Gender { Name = "Other", Code = "O", SortOrder = 3, IsActive = true },
                    new Gender { Name = "Prefer not to say", Code = "N", SortOrder = 4, IsActive = true }
                };

                _context.Genders.AddRange(genders);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedLanguagesAsync()
        {
            if (!await _context.Languages.AnyAsync())
            {
                var languages = new[]
                {
                    new Language { Name = "English", Code = "en", CountryCode = "US", NativeName = "English", Direction = "LTR", IsDefault = true, SortOrder = 1, IsActive = true },
                    new Language { Name = "Arabic", Code = "ar", CountryCode = "AE", NativeName = "العربية", Direction = "RTL", SortOrder = 2, IsActive = true },
                    new Language { Name = "Hindi", Code = "hi", CountryCode = "IN", NativeName = "हिन्दी", Direction = "LTR", SortOrder = 3, IsActive = true },
                    new Language { Name = "French", Code = "fr", CountryCode = "FR", NativeName = "Français", Direction = "LTR", SortOrder = 4, IsActive = true },
                    new Language { Name = "Spanish", Code = "es", CountryCode = "ES", NativeName = "Español", Direction = "LTR", SortOrder = 5, IsActive = true }
                };

                _context.Languages.AddRange(languages);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedNationalitiesAsync()
        {
            if (!await _context.Nationalities.AnyAsync())
            {
                var nationalities = new[]
                {
                    new Nationality { Name = "United Arab Emirates", Code = "AE", Alpha3Code = "ARE", Region = "Middle East", Currency = "UAE Dirham", CurrencyCode = "AED", RequiresVisa = false, SortOrder = 1, IsActive = true },
                    new Nationality { Name = "United States", Code = "US", Alpha3Code = "USA", Region = "North America", Currency = "US Dollar", CurrencyCode = "USD", RequiresVisa = false, SortOrder = 2, IsActive = true },
                    new Nationality { Name = "India", Code = "IN", Alpha3Code = "IND", Region = "Asia", Currency = "Indian Rupee", CurrencyCode = "INR", RequiresVisa = false, SortOrder = 3, IsActive = true },
                    new Nationality { Name = "United Kingdom", Code = "GB", Alpha3Code = "GBR", Region = "Europe", Currency = "British Pound", CurrencyCode = "GBP", RequiresVisa = false, SortOrder = 4, IsActive = true },
                    new Nationality { Name = "Canada", Code = "CA", Alpha3Code = "CAN", Region = "North America", Currency = "Canadian Dollar", CurrencyCode = "CAD", RequiresVisa = false, SortOrder = 5, IsActive = true },
                    new Nationality { Name = "Australia", Code = "AU", Alpha3Code = "AUS", Region = "Oceania", Currency = "Australian Dollar", CurrencyCode = "AUD", RequiresVisa = false, SortOrder = 6, IsActive = true },
                    new Nationality { Name = "Germany", Code = "DE", Alpha3Code = "DEU", Region = "Europe", Currency = "Euro", CurrencyCode = "EUR", RequiresVisa = false, SortOrder = 7, IsActive = true },
                    new Nationality { Name = "France", Code = "FR", Alpha3Code = "FRA", Region = "Europe", Currency = "Euro", CurrencyCode = "EUR", RequiresVisa = false, SortOrder = 8, IsActive = true },
                    new Nationality { Name = "Philippines", Code = "PH", Alpha3Code = "PHL", Region = "Asia", Currency = "Philippine Peso", CurrencyCode = "PHP", RequiresVisa = true, SortOrder = 9, IsActive = true },
                    new Nationality { Name = "Pakistan", Code = "PK", Alpha3Code = "PAK", Region = "Asia", Currency = "Pakistani Rupee", CurrencyCode = "PKR", RequiresVisa = true, SortOrder = 10, IsActive = true }
                };

                _context.Nationalities.AddRange(nationalities);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedDepartmentsAsync()
        {
            if (!await _context.Departments.AnyAsync())
            {
                var departments = new[]
                {
                    new Department { Name = "Cardiology", Code = "CARD", Description = "Heart and cardiovascular system", HeadOfDepartment = "Dr. Ahmed Al-Mansoori", Location = "Building A, Floor 3", PhoneNumber = "+971-4-1234567", Email = "cardiology@redsky.ae", Budget = 2500000, IsActive = true },
                    new Department { Name = "Neurology", Code = "NEURO", Description = "Brain and nervous system", HeadOfDepartment = "Dr. Sarah Johnson", Location = "Building A, Floor 4", PhoneNumber = "+971-4-1234568", Email = "neurology@redsky.ae", Budget = 3000000, IsActive = true },
                    new Department { Name = "Orthopedics", Code = "ORTHO", Description = "Bones, joints, and musculoskeletal system", HeadOfDepartment = "Dr. Michael Brown", Location = "Building B, Floor 2", PhoneNumber = "+971-4-1234569", Email = "orthopedics@redsky.ae", Budget = 2000000, IsActive = true },
                    new Department { Name = "Emergency Medicine", Code = "ER", Description = "Emergency and urgent care", HeadOfDepartment = "Dr. Fatima Al-Zahra", Location = "Building A, Ground Floor", PhoneNumber = "+971-4-1234570", Email = "emergency@redsky.ae", Budget = 1800000, IsActive = true },
                    new Department { Name = "Pediatrics", Code = "PEDS", Description = "Children's healthcare", HeadOfDepartment = "Dr. Lisa Chen", Location = "Building C, Floor 1", PhoneNumber = "+971-4-1234571", Email = "pediatrics@redsky.ae", Budget = 1500000, IsActive = true },
                    new Department { Name = "Radiology", Code = "RAD", Description = "Medical imaging and diagnostics", HeadOfDepartment = "Dr. Omar Hassan", Location = "Building A, Floor 1", PhoneNumber = "+971-4-1234572", Email = "radiology@redsky.ae", Budget = 2200000, IsActive = true },
                    new Department { Name = "Physical Therapy", Code = "PT", Description = "Rehabilitation and physical therapy", HeadOfDepartment = "Dr. Anna Kowalski", Location = "Building B, Floor 1", PhoneNumber = "+971-4-1234573", Email = "physicaltherapy@redsky.ae", Budget = 800000, IsActive = true }
                };

                _context.Departments.AddRange(departments);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedRoomsAsync()
        {
            if (!await _context.Rooms.AnyAsync())
            {
                var rooms = new[]
                {
                    // Building A - Cardiology
                    new Room { RoomNumber = "A301", RoomType = "Private", Department = "Cardiology", Capacity = 1, Status = "Available", Floor = 3, DailyRate = 800, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Private Bathroom\"]" },
                    new Room { RoomNumber = "A302", RoomType = "Private", Department = "Cardiology", Capacity = 1, Status = "Occupied", Floor = 3, DailyRate = 800, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Private Bathroom\"]" },
                    new Room { RoomNumber = "A303", RoomType = "Semi-Private", Department = "Cardiology", Capacity = 2, Status = "Available", Floor = 3, DailyRate = 600, Amenities = "[\"AC\", \"TV\", \"WiFi\"]" },
                    
                    // Building A - Neurology
                    new Room { RoomNumber = "A401", RoomType = "Private", Department = "Neurology", Capacity = 1, Status = "Available", Floor = 4, DailyRate = 850, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Private Bathroom\", \"Monitoring Equipment\"]" },
                    new Room { RoomNumber = "A402", RoomType = "ICU", Department = "Neurology", Capacity = 1, Status = "Available", Floor = 4, DailyRate = 1200, Amenities = "[\"AC\", \"Advanced Monitoring\", \"Ventilator Support\"]" },
                    
                    // Building B - Orthopedics
                    new Room { RoomNumber = "B201", RoomType = "Private", Department = "Orthopedics", Capacity = 1, Status = "Available", Floor = 2, DailyRate = 750, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Adjustable Bed\"]" },
                    new Room { RoomNumber = "B202", RoomType = "Ward", Department = "Orthopedics", Capacity = 4, Status = "Available", Floor = 2, DailyRate = 400, Amenities = "[\"AC\", \"Shared TV\"]" },
                    
                    // Emergency
                    new Room { RoomNumber = "A101", RoomType = "Emergency", Department = "Emergency Medicine", Capacity = 1, Status = "Available", Floor = 1, DailyRate = 500, Amenities = "[\"Emergency Equipment\", \"Monitoring\"]" },
                    new Room { RoomNumber = "A102", RoomType = "Emergency", Department = "Emergency Medicine", Capacity = 1, Status = "Available", Floor = 1, DailyRate = 500, Amenities = "[\"Emergency Equipment\", \"Monitoring\"]" },
                    
                    // Pediatrics
                    new Room { RoomNumber = "C101", RoomType = "Private", Department = "Pediatrics", Capacity = 1, Status = "Available", Floor = 1, DailyRate = 700, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Child-Friendly Decor\", \"Play Area\"]" },
                    new Room { RoomNumber = "C102", RoomType = "Semi-Private", Department = "Pediatrics", Capacity = 2, Status = "Available", Floor = 1, DailyRate = 550, Amenities = "[\"AC\", \"TV\", \"WiFi\", \"Child-Friendly Decor\"]" }
                };

                _context.Rooms.AddRange(rooms);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedTreatmentsAsync()
        {
            if (!await _context.Treatments.AnyAsync())
            {
                var treatments = new[]
                {
                    // Cardiology
                    new Treatment { Name = "Electrocardiogram (ECG)", Code = "ECG001", Category = "Cardiology", Description = "Recording of electrical activity of the heart", Price = 150, DurationMinutes = 30, Department = "Cardiology", RequiresSpecialist = true, IsActive = true },
                    new Treatment { Name = "Echocardiogram", Code = "ECHO001", Category = "Cardiology", Description = "Ultrasound of the heart", Price = 350, DurationMinutes = 45, Department = "Cardiology", RequiresSpecialist = true, IsActive = true },
                    new Treatment { Name = "Cardiac Catheterization", Code = "CATH001", Category = "Cardiology", Description = "Invasive procedure to examine heart function", Price = 2500, DurationMinutes = 120, Department = "Cardiology", RequiresSpecialist = true, IsActive = true },
                    
                    // Neurology
                    new Treatment { Name = "MRI Brain Scan", Code = "MRI001", Category = "Neurology", Description = "Magnetic resonance imaging of the brain", Price = 800, DurationMinutes = 60, Department = "Neurology", RequiresSpecialist = true, IsActive = true },
                    new Treatment { Name = "EEG", Code = "EEG001", Category = "Neurology", Description = "Electroencephalogram to measure brain activity", Price = 300, DurationMinutes = 90, Department = "Neurology", RequiresSpecialist = true, IsActive = true },
                    new Treatment { Name = "Neurological Consultation", Code = "NEURO001", Category = "Neurology", Description = "Comprehensive neurological examination", Price = 250, DurationMinutes = 60, Department = "Neurology", RequiresSpecialist = true, IsActive = true },
                    
                    // Orthopedics
                    new Treatment { Name = "X-Ray", Code = "XRAY001", Category = "Orthopedics", Description = "Radiographic imaging", Price = 100, DurationMinutes = 15, Department = "Orthopedics", RequiresSpecialist = false, IsActive = true },
                    new Treatment { Name = "Physiotherapy Session", Code = "PT001", Category = "Physical Therapy", Description = "Individual physiotherapy treatment", Price = 120, DurationMinutes = 60, Department = "Physical Therapy", RequiresSpecialist = true, IsActive = true },
                    new Treatment { Name = "Joint Injection", Code = "INJECT001", Category = "Orthopedics", Description = "Therapeutic injection for joint pain", Price = 200, DurationMinutes = 30, Department = "Orthopedics", RequiresSpecialist = true, IsActive = true },
                    
                    // General
                    new Treatment { Name = "General Consultation", Code = "GEN001", Category = "General", Description = "General medical consultation", Price = 150, DurationMinutes = 30, Department = "General Medicine", RequiresSpecialist = false, IsActive = true },
                    new Treatment { Name = "Blood Test", Code = "BLOOD001", Category = "Laboratory", Description = "Complete blood count and analysis", Price = 80, DurationMinutes = 15, Department = "Laboratory", RequiresSpecialist = false, IsActive = true },
                    new Treatment { Name = "Vaccination", Code = "VAC001", Category = "Preventive", Description = "Immunization service", Price = 50, DurationMinutes = 15, Department = "General Medicine", RequiresSpecialist = false, IsActive = true }
                };

                _context.Treatments.AddRange(treatments);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedCliniciansAsync()
        {
            var departments = await _context.Departments.ToListAsync();
            if (!await _context.Clinicians.AnyAsync() && departments.Any())
            {
                var clinicians = new[]
                {
                    // Cardiology
                    new Clinician { FirstName = "Ahmed", LastName = "Al-Mansoori", EmployeeId = "DOC001", Email = "ahmed.almansoori@redsky.ae", PhoneNumber = "+971-50-1234567", Gender = "Male", DepartmentId = departments.First(d => d.Code == "CARD").Id, Position = "Cardiologist", Specializations = "Interventional Cardiology, Heart Surgery", Qualifications = "MD, FRCS", LicenseNumber = "DHA-12345", JoinDate = DateTime.Now.AddYears(-5), Salary = 45000, IsActive = true },
                    new Clinician { FirstName = "Priya", LastName = "Sharma", EmployeeId = "DOC002", Email = "priya.sharma@redsky.ae", PhoneNumber = "+971-50-1234568", Gender = "Female", DepartmentId = departments.First(d => d.Code == "CARD").Id, Position = "Cardiologist", Specializations = "Preventive Cardiology", Qualifications = "MD, DM Cardiology", LicenseNumber = "DHA-12346", JoinDate = DateTime.Now.AddYears(-3), Salary = 38000, IsActive = true },
                    
                    // Neurology
                    new Clinician { FirstName = "Sarah", LastName = "Johnson", EmployeeId = "DOC003", Email = "sarah.johnson@redsky.ae", PhoneNumber = "+971-50-1234569", Gender = "Female", DepartmentId = departments.First(d => d.Code == "NEURO").Id, Position = "Neurologist", Specializations = "Stroke, Epilepsy", Qualifications = "MD, PhD Neurology", LicenseNumber = "DHA-12347", JoinDate = DateTime.Now.AddYears(-7), Salary = 42000, IsActive = true },
                    new Clinician { FirstName = "Omar", LastName = "Hassan", EmployeeId = "DOC004", Email = "omar.hassan@redsky.ae", PhoneNumber = "+971-50-1234570", Gender = "Male", DepartmentId = departments.First(d => d.Code == "NEURO").Id, Position = "Neurologist", Specializations = "Neurosurgery, Brain Tumors", Qualifications = "MD, MCh Neurosurgery", LicenseNumber = "DHA-12348", JoinDate = DateTime.Now.AddYears(-4), Salary = 48000, IsActive = true },
                    
                    // Orthopedics
                    new Clinician { FirstName = "Michael", LastName = "Brown", EmployeeId = "DOC005", Email = "michael.brown@redsky.ae", PhoneNumber = "+971-50-1234571", Gender = "Male", DepartmentId = departments.First(d => d.Code == "ORTHO").Id, Position = "Orthopedic Surgeon", Specializations = "Joint Replacement, Sports Medicine", Qualifications = "MD, MS Orthopedics", LicenseNumber = "DHA-12349", JoinDate = DateTime.Now.AddYears(-6), Salary = 44000, IsActive = true },
                    
                    // Emergency
                    new Clinician { FirstName = "Fatima", LastName = "Al-Zahra", EmployeeId = "DOC006", Email = "fatima.alzahra@redsky.ae", PhoneNumber = "+971-50-1234572", Gender = "Female", DepartmentId = departments.First(d => d.Code == "ER").Id, Position = "Emergency Physician", Specializations = "Emergency Medicine, Trauma", Qualifications = "MD, Emergency Medicine", LicenseNumber = "DHA-12350", JoinDate = DateTime.Now.AddYears(-2), Salary = 35000, IsActive = true },
                    
                    // Pediatrics
                    new Clinician { FirstName = "Lisa", LastName = "Chen", EmployeeId = "DOC007", Email = "lisa.chen@redsky.ae", PhoneNumber = "+971-50-1234573", Gender = "Female", DepartmentId = departments.First(d => d.Code == "PEDS").Id, Position = "Pediatrician", Specializations = "Child Development, Immunization", Qualifications = "MD, DCH", LicenseNumber = "DHA-12351", JoinDate = DateTime.Now.AddYears(-4), Salary = 36000, IsActive = true },
                    
                    // Nurses
                    new Clinician { FirstName = "Maria", LastName = "Santos", EmployeeId = "NUR001", Email = "maria.santos@redsky.ae", PhoneNumber = "+971-50-1234574", Gender = "Female", DepartmentId = departments.First(d => d.Code == "CARD").Id, Position = "Registered Nurse", Specializations = "Cardiac Care", Qualifications = "BSN, RN", LicenseNumber = "DHA-NUR001", JoinDate = DateTime.Now.AddYears(-3), Salary = 12000, IsActive = true },
                    new Clinician { FirstName = "John", LastName = "Williams", EmployeeId = "NUR002", Email = "john.williams@redsky.ae", PhoneNumber = "+971-50-1234575", Gender = "Male", DepartmentId = departments.First(d => d.Code == "ER").Id, Position = "Registered Nurse", Specializations = "Emergency Care", Qualifications = "BSN, RN", LicenseNumber = "DHA-NUR002", JoinDate = DateTime.Now.AddYears(-2), Salary = 11000, IsActive = true }
                };

                _context.Clinicians.AddRange(clinicians);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedWellnessProgramsAsync()
        {
            if (!await _context.WellnessPrograms.AnyAsync())
            {
                var programs = new[]
                {
                    new WellnessProgram { Name = "Heart Health Program", Code = "HEART001", Category = "Cardiovascular", Description = "Comprehensive heart health assessment and lifestyle guidance", Price = 1200, DurationDays = 30, TargetAgeGroup = "40+", Benefits = "Risk assessment, diet planning, exercise program", MaxParticipants = 20, InstructorName = "Dr. Ahmed Al-Mansoori", Location = "Cardiology Department", Schedule = "Weekly", IsActive = true, Status = "Active" },
                    new WellnessProgram { Name = "Diabetes Management", Code = "DIAB001", Category = "Metabolic", Description = "Diabetes prevention and management program", Price = 800, DurationDays = 60, TargetAgeGroup = "30+", Benefits = "Blood sugar monitoring, nutrition counseling, medication management", MaxParticipants = 15, InstructorName = "Dr. Priya Sharma", Location = "Wellness Center", Schedule = "Bi-weekly", IsActive = true, Status = "Active" },
                    new WellnessProgram { Name = "Weight Management", Code = "WEIGHT001", Category = "Nutrition", Description = "Healthy weight loss and maintenance program", Price = 600, DurationDays = 90, TargetAgeGroup = "18+", Benefits = "Personalized diet plan, fitness coaching, progress tracking", MaxParticipants = 25, InstructorName = "Nutritionist Sarah Ahmed", Location = "Wellness Center", Schedule = "Weekly", IsActive = true, Status = "Active" },
                    new WellnessProgram { Name = "Stress Management", Code = "STRESS001", Category = "Mental Health", Description = "Stress reduction and mindfulness program", Price = 400, DurationDays = 45, TargetAgeGroup = "18+", Benefits = "Meditation techniques, stress coping strategies, relaxation methods", MaxParticipants = 30, InstructorName = "Dr. Lisa Chen", Location = "Wellness Center", Schedule = "Weekly", IsActive = true, Status = "Active" },
                    new WellnessProgram { Name = "Senior Fitness", Code = "SENIOR001", Category = "Fitness", Description = "Low-impact fitness program for seniors", Price = 300, DurationDays = 60, TargetAgeGroup = "65+", Benefits = "Gentle exercises, balance training, social interaction", MaxParticipants = 15, InstructorName = "Physical Therapist Anna", Location = "Physical Therapy", Schedule = "Bi-weekly", IsActive = true, Status = "Active" }
                };

                _context.WellnessPrograms.AddRange(programs);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SeedPackagesAsync()
        {
            var treatments = await _context.Treatments.ToListAsync();
            if (!await _context.Packages.AnyAsync() && treatments.Any())
            {
                var packages = new[]
                {
                    new Package { Name = "Complete Health Checkup", Code = "PKG001", Category = "Preventive", Description = "Comprehensive health screening package", OriginalPrice = 1000, PackagePrice = 750, DiscountPercentage = 25, ValidityDays = 365, Department = "General Medicine", MaxUsage = 1, IsActive = true, Inclusions = "Blood tests, ECG, X-Ray, General consultation", Exclusions = "Specialized procedures" },
                    new Package { Name = "Cardiac Care Package", Code = "PKG002", Category = "Cardiology", Description = "Complete cardiac evaluation and treatment", OriginalPrice = 2000, PackagePrice = 1600, DiscountPercentage = 20, ValidityDays = 180, Department = "Cardiology", MaxUsage = 1, IsActive = true, Inclusions = "ECG, Echocardiogram, Cardiac consultation", Exclusions = "Surgical procedures" },
                    new Package { Name = "Orthopedic Assessment", Code = "PKG003", Category = "Orthopedics", Description = "Joint and bone health evaluation", OriginalPrice = 800, PackagePrice = 650, DiscountPercentage = 18.75m, ValidityDays = 90, Department = "Orthopedics", MaxUsage = 1, IsActive = true, Inclusions = "X-Ray, Orthopedic consultation, Physiotherapy session", Exclusions = "Surgery, Advanced imaging" },
                    new Package { Name = "Family Wellness Package", Code = "PKG004", Category = "Family", Description = "Health package for entire family", OriginalPrice = 2500, PackagePrice = 1875, DiscountPercentage = 25, ValidityDays = 365, Department = "General Medicine", MaxUsage = 4, IsActive = true, Inclusions = "Health checkups for 4 family members, Vaccinations", Exclusions = "Specialized treatments" }
                };

                _context.Packages.AddRange(packages);
                await _context.SaveChangesAsync();

                // Add package items
                var completeHealthPackage = packages[0];
                var cardiacPackage = packages[1];
                var orthoPackage = packages[2];

                var packageItems = new[]
                {
                    // Complete Health Checkup items
                    new PackageItem { PackageId = completeHealthPackage.Id, TreatmentId = treatments.First(t => t.Code == "GEN001").Id, Quantity = 1, UnitPrice = 150, TotalPrice = 150 },
                    new PackageItem { PackageId = completeHealthPackage.Id, TreatmentId = treatments.First(t => t.Code == "BLOOD001").Id, Quantity = 1, UnitPrice = 80, TotalPrice = 80 },
                    new PackageItem { PackageId = completeHealthPackage.Id, TreatmentId = treatments.First(t => t.Code == "XRAY001").Id, Quantity = 1, UnitPrice = 100, TotalPrice = 100 },
                    new PackageItem { PackageId = completeHealthPackage.Id, TreatmentId = treatments.First(t => t.Code == "ECG001").Id, Quantity = 1, UnitPrice = 150, TotalPrice = 150 },

                    // Cardiac Care Package items
                    new PackageItem { PackageId = cardiacPackage.Id, TreatmentId = treatments.First(t => t.Code == "ECG001").Id, Quantity = 1, UnitPrice = 150, TotalPrice = 150 },
                    new PackageItem { PackageId = cardiacPackage.Id, TreatmentId = treatments.First(t => t.Code == "ECHO001").Id, Quantity = 1, UnitPrice = 350, TotalPrice = 350 },

                    // Orthopedic Assessment items
                    new PackageItem { PackageId = orthoPackage.Id, TreatmentId = treatments.First(t => t.Code == "XRAY001").Id, Quantity = 1, UnitPrice = 100, TotalPrice = 100 },
                    new PackageItem { PackageId = orthoPackage.Id, TreatmentId = treatments.First(t => t.Code == "PT001").Id, Quantity = 1, UnitPrice = 120, TotalPrice = 120 }
                };

                _context.PackageItems.AddRange(packageItems);
                await _context.SaveChangesAsync();
            }
        }
    }
}
