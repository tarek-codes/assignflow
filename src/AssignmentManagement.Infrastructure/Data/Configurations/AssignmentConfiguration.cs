using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("assignments");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("assignment_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.ClassId).HasColumnName("class_id").IsRequired();
        builder.Property(entity => entity.Title).IsRequired().HasMaxLength(255);
        builder.Property(entity => entity.Description);
        builder.Property(entity => entity.Instructions);
        builder.Property(entity => entity.DeadlineUtc).HasColumnName("deadline").IsRequired();
        builder.Property(entity => entity.MaxMarks).HasColumnName("max_marks").IsRequired();
        builder.Property(entity => entity.Status).HasConversion<string>().HasMaxLength(50).HasDefaultValue(AssignmentStatus.Draft);
        builder.Property(entity => entity.AllowResubmission).HasColumnName("allow_resubmission").HasDefaultValue(true);
        builder.Property(entity => entity.CreatedAtUtc).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(entity => entity.UpdatedAtUtc).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => entity.ClassId).HasDatabaseName("idx_assignments_class");

        builder.HasOne(entity => entity.Class)
            .WithMany(entity => entity!.Assignments)
            .HasForeignKey(entity => entity.ClassId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}