using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Mapping;
using AssignmentManagement.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AssignmentManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(ApplicationMappingProfile).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<ISubjectService, SubjectService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}