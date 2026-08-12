using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("submissions");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("submission_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.AssignmentId).HasColumnName("assignment_id").IsRequired();
        builder.Property(entity => entity.StudentId).HasColumnName("student_id").IsRequired();
        builder.Property(entity => entity.SubmissionText).HasColumnName("submission_text");
        builder.Property(entity => entity.FileUrl).HasColumnName("file_url");
        builder.Property(entity => entity.SubmittedAtUtc).HasColumnName("submitted_at");
        builder.Property(entity => entity.Marks).HasColumnName("marks").HasPrecision(5, 2);
        builder.Property(entity => entity.Feedback).HasColumnName("feedback");
        builder.Property(entity => entity.Status).HasConversion<string>().HasMaxLength(50).HasDefaultValue(SubmissionStatus.NotSubmitted);
        builder.Property(entity => entity.UpdatedAtUtc).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => entity.AssignmentId).HasDatabaseName("idx_submissions_assignment");
        builder.HasIndex(entity => entity.StudentId).HasDatabaseName("idx_submissions_student");
        builder.HasIndex(entity => new { entity.AssignmentId, entity.StudentId }).IsUnique().HasDatabaseName("ux_submissions_assignment_id_student_id");

        builder.HasOne(entity => entity.Assignment)
            .WithMany(entity => entity!.Submissions)
            .HasForeignKey(entity => entity.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(entity => entity.Student)
            .WithMany(entity => entity!.Submissions)
            .HasForeignKey(entity => entity.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}