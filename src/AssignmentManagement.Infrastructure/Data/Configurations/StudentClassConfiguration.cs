using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class StudentClassConfiguration : IEntityTypeConfiguration<StudentClass>
{
    public void Configure(EntityTypeBuilder<StudentClass> builder)
    {
        builder.ToTable("student_classes");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("enrollment_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.StudentId).HasColumnName("student_id").IsRequired();
        builder.Property(entity => entity.ClassId).HasColumnName("class_id").IsRequired();
        builder.Property(entity => entity.EnrolledAtUtc).HasColumnName("enrolled_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => entity.StudentId).HasDatabaseName("idx_student_classes_student");
        builder.HasIndex(entity => entity.ClassId).HasDatabaseName("idx_student_classes_class");
        builder.HasIndex(entity => new { entity.StudentId, entity.ClassId }).IsUnique().HasDatabaseName("ux_student_classes_student_id_class_id");

        builder.HasOne(entity => entity.Student)
            .WithMany(entity => entity!.StudentClasses)
            .HasForeignKey(entity => entity.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(entity => entity.Class)
            .WithMany(entity => entity!.StudentClasses)
            .HasForeignKey(entity => entity.ClassId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}