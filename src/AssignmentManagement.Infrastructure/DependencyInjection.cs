using AssignmentManagement.Application.Abstractions.Persistence;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Infrastructure.Data;
using AssignmentManagement.Infrastructure.Repositories;
using AssignmentManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AssignmentManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention();
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUserRepository, UserManagementRepository>();
        services.AddScoped<IUserManagementRepository, UserManagementRepository>();
        services.AddScoped<ISubjectRepository, SubjectRepository>();
        services.AddScoped<IClassRepository, ClassRepository>();
        services.AddScoped<IAssignmentRepository, AssignmentRepository>();
        services.AddScoped<ISubmissionRepository, SubmissionRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtService, JwtService>();
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.AddScoped<IStorageService, StorageService>();

        return services;
    }
}