using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Data.Configurations;

public sealed class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.ToTable("app_settings");

        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).HasColumnName("setting_id").ValueGeneratedOnAdd();

        builder.Property(entity => entity.SettingKey).IsRequired().HasMaxLength(100);
        builder.Property(entity => entity.SettingValue);
        builder.Property(entity => entity.Description);
        builder.Property(entity => entity.UpdatedByAdminId).HasColumnName("updated_by");
        builder.Property(entity => entity.UpdatedAtUtc).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasIndex(entity => entity.SettingKey).IsUnique().HasDatabaseName("ux_app_settings_setting_key");

        builder.HasOne(entity => entity.UpdatedByAdmin)
            .WithMany(entity => entity!.UpdatedAppSettings)
            .HasForeignKey(entity => entity.UpdatedByAdminId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}