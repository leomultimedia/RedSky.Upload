using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
// using Microsoft.AspNetCore.RateLimiting;
using RedSky.Api.Data;
using RedSky.Api.Services;
using RedSky.Api.Security;
using RedSky.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=app.db"));

builder.Services.AddScoped<ExcelImportService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("spa", p =>
        p.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
});

// API key auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = ApiKeyAuthHandler.SchemeName;
    options.DefaultChallengeScheme = ApiKeyAuthHandler.SchemeName;
}).AddScheme<AuthenticationSchemeOptions, ApiKeyAuthHandler>(ApiKeyAuthHandler.SchemeName, _ => { });

// Rate limiting (basic)
// Rate limiting can be enabled when the framework package is available
// builder.Services.AddRateLimiter(o =>
// {
//     o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
//         RateLimitPartition.GetFixedWindowLimiter(
//             partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anon",
//             factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
//             {
//                 PermitLimit = 120,
//                 Window = TimeSpan.FromMinutes(1),
//                 QueueLimit = 0,
//                 QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst
//             }));
// });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HSTS in non-dev
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Security headers and CSP
var csp = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:5034 http://localhost:3000; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
app.UseMiddleware<SecurityHeadersMiddleware>(csp);
app.UseMiddleware<PrivacyLoggingMiddleware>();

app.UseCors("spa");
app.UseHttpsRedirection();
// app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
