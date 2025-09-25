using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace RedSky.Api.Security
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _csp;
        public SecurityHeadersMiddleware(RequestDelegate next, string csp)
        {
            _next = next;
            _csp = csp;
        }

        public async Task Invoke(HttpContext context)
        {
            var headers = context.Response.Headers;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "no-referrer";
            headers["X-XSS-Protection"] = "0";
            headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
            headers["Content-Security-Policy"] = _csp;
            await _next(context);
        }
    }
}


