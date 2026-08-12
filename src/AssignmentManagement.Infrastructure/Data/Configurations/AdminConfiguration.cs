using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.ToTable("admins");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("admin_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.UserId).HasColumnName("user_id").IsRequired();

        builder.HasIndex(entity => entity.UserId).IsUnique().HasDatabaseName("ux_admins_user_id");

        builder.HasOne(entity => entity.User)
            .WithOne(entity => entity!.Admin)
            .HasForeignKey<Admin>(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}