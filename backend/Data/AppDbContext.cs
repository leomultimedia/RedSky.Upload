using Microsoft.EntityFrameworkCore;
using RedSky.Api.Models;

namespace RedSky.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Visit> Visits { get; set; }
        
        // Masters Module
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Treatment> Treatments { get; set; }
        public DbSet<TreatmentPlan> TreatmentPlans { get; set; }
        public DbSet<TreatmentPlanItem> TreatmentPlanItems { get; set; }
        public DbSet<Package> Packages { get; set; }
        public DbSet<PackageItem> PackageItems { get; set; }
        public DbSet<WellnessProgram> WellnessPrograms { get; set; }
        
        // Clinician Management
        public DbSet<Department> Departments { get; set; }
        public DbSet<Clinician> Clinicians { get; set; }
        public DbSet<Therapist> Therapists { get; set; }
        public DbSet<TherapySession> TherapySessions { get; set; }
        
        // General Settings
        public DbSet<Gender> Genders { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<Nationality> Nationalities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Patient>()
                .Property(p => p.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Visit>()
                .Property(v => v.Id)
                .ValueGeneratedOnAdd();
            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.EmrNo)
                .IsUnique();

            modelBuilder.Entity<Visit>()
                .HasIndex(v => v.VisitNo);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Visits)
                .WithOne(v => v.Patient!)
                .HasForeignKey(v => v.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}


