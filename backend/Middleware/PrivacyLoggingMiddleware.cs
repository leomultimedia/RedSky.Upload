using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace RedSky.Api.Middleware
{
    public class PrivacyLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<PrivacyLoggingMiddleware> _logger;

        public PrivacyLoggingMiddleware(RequestDelegate next, ILogger<PrivacyLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            var sw = Stopwatch.StartNew();
            var path = context.Request.Path.ToString();
            var method = context.Request.Method;
            var ip = context.Connection.RemoteIpAddress?.ToString();

            await _next(context);

            sw.Stop();
            var status = context.Response.StatusCode;
            _logger.LogInformation("{Method} {Path} -> {Status} in {Elapsed} ms from {IP}", method, path, status, sw.ElapsedMilliseconds, ip);
        }
    }
}


