using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace Foyer.Models;

internal class FoyerContext(DbContextOptions<FoyerContext> options) : DbContext(options)
{
    public DbSet<Task> Tasks { get; set; }
    public DbSet<DoneTask> DoneTasks { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Task>()
            .OwnsOne(t => t.Meta, m =>
            {
                m.ToJson();
            });
    }
}

[Flags]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WeekDay
{
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
    Weekend = Saturday |  Sunday,
}

[Flags]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Week
{
    First,
    Second,
    Third,
    Fourth,
    Last
}

public class Meta
{
    public int Interval  { get; set; }
    public WeekDay[]? DaysOfWeek { get; set; }
    public WeekDay? DayOfWeek { get; set; }
    public int? Each { get; set; }
    public Week? Week { get; set; }
}

public class Task
{
    public int Id { get; set; }
    public string Title { get; set; }
    public DateOnly StartDate { get; set; }
    public Frequency Frequency { get; set; }
    
    [Column(TypeName = "jsonb")]
    public Meta? Meta { get; set; }
    
    public virtual ICollection<DoneTask> DoneTasks { get; set; } = new List<DoneTask>();
}