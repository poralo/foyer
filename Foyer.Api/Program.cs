using Foyer.Endpoints;
using Foyer.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Task = System.Threading.Tasks.Task;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContextPool<FoyerContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("FoyerContext"), o => {
        o.MapEnum<Frequency>(nameof(Frequency).ToLowerInvariant());
    })
    .UseSnakeCaseNamingConvention());

builder.Services.AddAuthentication()
    .AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapTaskEndpoints();

app.Run();