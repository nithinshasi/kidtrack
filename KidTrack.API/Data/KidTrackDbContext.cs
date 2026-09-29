using Microsoft.EntityFrameworkCore;
using KidTrack.API.Models;
using RouteModel = KidTrack.API.Models.Route;

namespace KidTrack.API.Data;

public class KidTrackDbContext : DbContext
{
    public KidTrackDbContext(DbContextOptions<KidTrackDbContext> options) : base(options) { }

    public DbSet<School> Schools => Set<School>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Parent> Parents => Set<Parent>();
    public DbSet<Bus> Buses => Set<Bus>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<RouteModel> Routes => Set<RouteModel>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TripHistory> TripHistories => Set<TripHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Student-Parent many-to-many
        modelBuilder.Entity<Student>()
            .HasMany(s => s.Parents)
            .WithMany(p => p.Students)
            .UsingEntity(j => j.ToTable("StudentParent"));

        // Bus-Driver one-to-one
        modelBuilder.Entity<Bus>()
            .HasOne(b => b.Driver)
            .WithOne(d => d.Bus)
            .HasForeignKey<Bus>(b => b.DriverId)
            .OnDelete(DeleteBehavior.SetNull);

        // Route-Bus
        modelBuilder.Entity<RouteModel>()
            .HasOne(r => r.Bus)
            .WithMany()
            .HasForeignKey(r => r.BusId)
            .OnDelete(DeleteBehavior.SetNull);

        // TripHistory cascades
        modelBuilder.Entity<TripHistory>()
            .HasOne(t => t.Bus)
            .WithMany(b => b.TripHistories)
            .HasForeignKey(t => t.BusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TripHistory>()
            .HasOne(t => t.Driver)
            .WithMany(d => d.TripHistories)
            .HasForeignKey(t => t.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Attendance
        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.TripHistory)
            .WithMany(t => t.Attendances)
            .HasForeignKey(a => a.TripHistoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        modelBuilder.Entity<Student>()
            .HasIndex(s => s.RollNumber);

        modelBuilder.Entity<Parent>()
            .HasIndex(p => p.Phone)
            .IsUnique();

        modelBuilder.Entity<Driver>()
            .HasIndex(d => d.Phone)
            .IsUnique();

        modelBuilder.Entity<Bus>()
            .HasIndex(b => b.RegistrationNumber)
            .IsUnique();
    }
}
