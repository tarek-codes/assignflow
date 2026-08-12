using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("user_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(entity => entity.LastName).HasMaxLength(100);
        builder.Property(entity => entity.Email).IsRequired().HasMaxLength(255);
        builder.Property(entity => entity.PasswordHash).IsRequired();
        builder.Property(entity => entity.Phone).HasMaxLength(30);
        builder.Property(entity => entity.Role).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(entity => entity.IsActive).HasDefaultValue(true);
        builder.Property(entity => entity.CreatedAtUtc).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(entity => entity.UpdatedAtUtc).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => entity.Email).IsUnique().HasDatabaseName("ux_users_email");
    }
}