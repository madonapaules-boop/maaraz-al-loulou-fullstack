using System.Net;
using MaarazAlLoulou.Api.Services;

namespace MaarazAlLoulou.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DomainValidationException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, exception.Message);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled request exception for {Path}", context.Request.Path);
            await WriteErrorAsync(
                context,
                HttpStatusCode.InternalServerError,
                "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode status, string message)
    {
        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = message, status = (int)status });
    }
}
