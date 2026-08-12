using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Services;
using AssignmentManagement.Api.Swagger;
using AssignmentManagement.Application.Abstractions.Services;
using AssignmentManagement.Application.Authentication;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

namespace AssignmentManagement.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPresentation(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

        services.AddFluentValidationAutoValidation();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerDocumentation(configuration);

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = ClaimTypes.NameIdentifier,
                    RoleClaimType = ClaimTypes.Role
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(PolicyNames.Admin, policy => policy.RequireRole(PolicyNames.Admin));
            options.AddPolicy(PolicyNames.Teacher, policy => policy.RequireRole(PolicyNames.Teacher));
            options.AddPolicy(PolicyNames.Student, policy => policy.RequireRole(PolicyNames.Student));
        });

        return services;
    }
}
