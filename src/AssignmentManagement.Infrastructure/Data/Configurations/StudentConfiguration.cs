using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("students");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("student_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(entity => entity.StudentNumber).IsRequired().HasMaxLength(50);
        builder.Property(entity => entity.ClassLevel).HasColumnName("class_level").IsRequired();

        builder.HasIndex(entity => entity.UserId).IsUnique().HasDatabaseName("ux_students_user_id");
        builder.HasIndex(entity => entity.StudentNumber).IsUnique().HasDatabaseName("ux_students_student_number");

        builder.HasOne(entity => entity.User)
            .WithOne(entity => entity!.Student)
            .HasForeignKey<Student>(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}