using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Data;

public sealed class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Admin> Admins => Set<Admin>();

    public DbSet<Teacher> Teachers => Set<Teacher>();

    public DbSet<Student> Students => Set<Student>();

    public DbSet<Subject> Subjects => Set<Subject>();

    public DbSet<TeacherSubject> TeacherSubjects => Set<TeacherSubject>();

    public DbSet<Class> Classes => Set<Class>();

    public DbSet<StudentClass> StudentClasses => Set<StudentClass>();

    public DbSet<Assignment> Assignments => Set<Assignment>();

    public DbSet<Submission> Submissions => Set<Submission>();

    public DbSet<AppSetting> AppSettings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TeacherSubject>()
            .HasKey(ts => new { ts.TeacherId, ts.SubjectId });

        modelBuilder.Entity<TeacherSubject>()
            .HasOne(ts => ts.Teacher)
            .WithMany(t => t!.TeacherSubjects)
            .HasForeignKey(ts => ts.TeacherId);

        modelBuilder.Entity<TeacherSubject>()
            .HasOne(ts => ts.Subject)
            .WithMany(s => s!.TeacherSubjects)
            .HasForeignKey(ts => ts.SubjectId);

        modelBuilder.Entity<User>()
            .Property(e => e.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Assignment>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Submission>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        SeedConfiguration.Apply(modelBuilder);
    }
}