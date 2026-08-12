using Serilog;

namespace AssignmentManagement.Api.Logging;

public static class LoggingExtensions
{
    public static IHostApplicationBuilder AddApplicationLogging(this IHostApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .CreateLogger();

        builder.Services.AddSerilog();

        return builder;
    }
}
