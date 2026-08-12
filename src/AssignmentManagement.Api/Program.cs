using AssignmentManagement.Api.Extensions;
using AssignmentManagement.Api.Logging;
using AssignmentManagement.Api.Middleware;
using AssignmentManagement.Application;
using AssignmentManagement.Infrastructure;
using AssignmentManagement.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationLogging();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPresentation(builder.Configuration);

var app = builder.Build();

await DbInitializer.InitializeAsync(app.Services);

app.UseMiddleware<ExceptionMiddleware>();
app.UsePresentation();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapControllers();

app.Run();
