using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("subjects");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("subject_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.SubjectName).IsRequired().HasMaxLength(100);
        builder.Property(entity => entity.SubjectCode).HasMaxLength(20);

        builder.HasIndex(entity => entity.SubjectName).IsUnique().HasDatabaseName("ux_subjects_subject_name");
        builder.HasIndex(entity => entity.SubjectCode).IsUnique().HasDatabaseName("ux_subjects_subject_code");
    }
}