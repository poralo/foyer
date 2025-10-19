using Foyer.Endpoints;
using Foyer.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContextPool<FoyerContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("FoyerContext"), o => {
        o.MapEnum<Frequency>(nameof(Frequency).ToLowerInvariant());
    })
    .UseSnakeCaseNamingConvention());

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");
app.MapTaskEndpoints();

app.Run();