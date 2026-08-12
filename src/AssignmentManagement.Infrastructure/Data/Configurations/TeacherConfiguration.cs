using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class TeacherConfiguration : IEntityTypeConfiguration<Teacher>
{
    public void Configure(EntityTypeBuilder<Teacher> builder)
    {
        builder.ToTable("teachers");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("teacher_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(entity => entity.Designation).HasMaxLength(100);

        builder.HasIndex(entity => entity.UserId).IsUnique().HasDatabaseName("ux_teachers_user_id");

        builder.HasOne(entity => entity.User)
            .WithOne(entity => entity!.Teacher)
            .HasForeignKey<Teacher>(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}