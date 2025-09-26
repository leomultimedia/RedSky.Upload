using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using RedSky.Api.Data;
using RedSky.Api.Services;
using RedSky.Api.Security;
using RedSky.Api.Middleware;
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policy for development
builder.Services.AddCors(options => {
    options.AddPolicy("dev", policy => {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("*");
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=app.db"));

// Health Checks
builder.Services.AddHealthChecks();

builder.Services.AddScoped<ExcelImportService>();
builder.Services.AddScoped<ExportService>();
builder.Services.AddScoped<DataSeedService>();
builder.Services.AddScoped<MasterDataSeedService>();


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
    app.UseCors("dev");
    
    // Disable HTTPS redirection for API routes
    app.UseWhen(context => !context.Request.Path.StartsWithSegments(""), 
        appBuilder => appBuilder.UseHttpsRedirection());
}

// HSTS in non-dev
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Security headers and CSP
var csp = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:5034 http://localhost:3000; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
app.UseMiddleware<SecurityHeadersMiddleware>(csp);
app.UseMiddleware<PrivacyLoggingMiddleware>();

app.UseCors("dev");
app.UseHttpsRedirection();
// app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

app.Run();
