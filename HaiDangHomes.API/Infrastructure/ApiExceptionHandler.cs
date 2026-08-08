using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace HaiDangHomes.API.Infrastructure;

public sealed class ApiExceptionHandler : IExceptionHandler
{
    private readonly ILogger<ApiExceptionHandler> _logger;

    public ApiExceptionHandler(ILogger<ApiExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var isValidation = exception is ValidationException;
        var status = isValidation
            ? StatusCodes.Status422UnprocessableEntity
            : StatusCodes.Status500InternalServerError;

        if (!isValidation)
            _logger.LogError(exception, "Unhandled API error. TraceId: {TraceId}", httpContext.TraceIdentifier);

        var errors = exception is ValidationException validation
            ? validation.Errors.Select(x => x.ErrorMessage).Distinct().ToArray()
            : new[] { "An unexpected error occurred." };

        var problem = new ProblemDetails
        {
            Status = status,
            Title = isValidation ? "Validation failed" : "Internal server error",
            Detail = errors[0],
            Instance = httpContext.Request.Path
        };
        problem.Extensions["errors"] = errors;
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
