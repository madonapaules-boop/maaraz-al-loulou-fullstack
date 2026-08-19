using System.Text;
using MaarazAlLoulou.Api.Data;
using MaarazAlLoulou.Api.Middleware;
using MaarazAlLoulou.Api.Repositories;
using MaarazAlLoulou.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("MaarazAlLoulou");
if (string.IsNullOrWhiteSpace(connectionString))
    builder.Services.AddDbContext<MaarazDbContext>(options => options.UseInMemoryDatabase("MaarazAlLoulouDev"));
else
    builder.Services.AddDbContext<MaarazDbContext>(options => options.UseSqlServer(connectionString));

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key must be set in configuration.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true
    });
builder.Services.AddAuthorization();
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
{
    policy.AllowAnyMethod().AllowAnyHeader();
    if (builder.Environment.IsDevelopment()) policy.SetIsOriginAllowed(_ => true);
    else policy.WithOrigins(origins);
}));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IProductImageStorage, LocalProductImageStorage>();

var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStaticFiles();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/admin/{*path:nonfile}", "admin/index.html");
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MaarazDbContext>();
    if (db.Database.IsRelational()) await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db, app.Configuration);
}
app.Run();
