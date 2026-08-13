namespace AssignmentManagement.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UsePresentation(this IApplicationBuilder app)
    {
        app.UseResponseCompression();
        app.UseCors("Frontend");
        return app;
    }
}
