using System.Net;
using System.Text.Json;
using FluentValidation;
using AssignmentManagement.Application.Common;

namespace AssignmentManagement.Api.Middleware;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled exception occurred while processing request {Method} {Path}", context.Request.Method, context.Request.Path);

            context.Response.StatusCode = exception switch
            {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                ForbiddenException => (int)HttpStatusCode.Forbidden,
                NotFoundException => (int)HttpStatusCode.NotFound,
                ConflictException => (int)HttpStatusCode.Conflict,
                ValidationException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };
            context.Response.ContentType = "application/json";

            var payload = new
            {
                message = exception.Message,
                statusCode = context.Response.StatusCode
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
