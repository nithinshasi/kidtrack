using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using KidTrack.API.Data;
using KidTrack.API.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<KidTrackDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure()));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "KidTrackDefaultSecretKey2024!@#$%^";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "KidTrack",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "KidTrackUsers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<ITripService, TripService>();

// CORS for Admin Portal + Mobile apps
builder.Services.AddCors(options =>
{
    options.AddPolicy("KidTrackPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "KidTrack API",
        Version = "v1",
        Description = "School Bus Safety & Tracking Platform API",
        Contact = new OpenApiContact { Name = "Sasiprakash", Email = "admin@kidtrack.in" }
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Application Insights
builder.Services.AddApplicationInsightsTelemetry();

var app = builder.Build();

// Firebase initialization (uses env variable GOOGLE_APPLICATION_CREDENTIALS)
try
{
    if (FirebaseApp.DefaultInstance == null)
    {
        var credPath = builder.Configuration["Firebase:CredentialsPath"];
        if (!string.IsNullOrEmpty(credPath) && File.Exists(credPath))
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile(credPath)
            });
        }
    }
}
catch (Exception ex)
{
    Log.Warning("Firebase initialization skipped: {Error}", ex.Message);
}

// Auto-migrate on startup (dev/pilot only; use explicit migrations in production)
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Pilot"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KidTrackDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "KidTrack API v1");
    c.RoutePrefix = string.Empty;
});

app.UseSerilogRequestLogging();
app.UseCors("KidTrackPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow, service = "KidTrack API" });

app.Run();
