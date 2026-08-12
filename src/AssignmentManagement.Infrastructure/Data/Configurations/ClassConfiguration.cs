using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class ClassConfiguration : IEntityTypeConfiguration<Class>
{
    public void Configure(EntityTypeBuilder<Class> builder)
    {
        builder.ToTable("classes");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("class_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.ClassLevel).IsRequired();
        builder.Property(entity => entity.SubjectId).HasColumnName("subject_id").IsRequired();
        builder.Property(entity => entity.TeacherId).HasColumnName("teacher_id").IsRequired();
        builder.Property(entity => entity.Description);
        builder.Property(entity => entity.IsActive).HasDefaultValue(true);
        builder.Property(entity => entity.CreatedAtUtc).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(entity => entity.UpdatedAtUtc).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => new { entity.ClassLevel, entity.SubjectId }).IsUnique().HasDatabaseName("ux_classes_class_level_subject_id");
        builder.HasIndex(entity => entity.TeacherId).HasDatabaseName("idx_classes_teacher");
        builder.HasIndex(entity => entity.SubjectId).HasDatabaseName("idx_classes_subject");

        builder.HasOne(entity => entity.Subject)
            .WithMany(entity => entity!.Classes)
            .HasForeignKey(entity => entity.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(entity => entity.Teacher)
            .WithMany(entity => entity!.Classes)
            .HasForeignKey(entity => entity.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}