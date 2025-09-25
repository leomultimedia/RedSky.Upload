using Microsoft.EntityFrameworkCore;
using RedSky.Api.Models;

namespace RedSky.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Visit> Visits => Set<Visit>();

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


