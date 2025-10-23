using Foyer.Models;
using Foyer.Requests;
using Foyer.Response;
using Microsoft.EntityFrameworkCore;
using Task = Foyer.Models.Task;

namespace Foyer.Endpoints;

public static class TasksEndpoints
{
    private static Week GetWeekOfMonth(DateTime date)
    {
        DateTime firstDayOfMonth = new DateTime(date.Year, date.Month, 1);
        int weekNumber = (int)Math.Ceiling((date.Day + (int)firstDayOfMonth.DayOfWeek) / 7.0);
        DateTime lastDayOfMonth = new DateTime(date.Year, date.Month, DateTime.DaysInMonth(date.Year, date.Month));
        if (weekNumber == Math.Ceiling((lastDayOfMonth.Day + (int)firstDayOfMonth.DayOfWeek) / 7.0))
        {
            return Week.Last;
        }

        return weekNumber switch
        {
            1 => Week.First,
            2 => Week.Second,
            3 => Week.Third,
            4 => Week.Fourth,
            _ => Week.Last
        };
    }
    private static async Task<IEnumerable<CreateTaskResponse>> Get(FoyerContext context, DateTime today)
    {
        var todayTasksNeverRepeatedQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Never && t.StartDate == DateOnly.FromDateTime(today));

        var todayTasksDailyRepeatedQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Daily && t.Meta != null
                                                       && t.StartDate <= DateOnly.FromDateTime(today)
                                                       && (today - t.StartDate.ToDateTime(TimeOnly.MinValue)).Days %
                                                       t.Meta.Interval == 0);

        var mapping = new Dictionary<DayOfWeek, WeekDay>
        {
            { DayOfWeek.Monday, WeekDay.Monday },
            { DayOfWeek.Tuesday, WeekDay.Tuesday },
            { DayOfWeek.Wednesday, WeekDay.Wednesday },
            { DayOfWeek.Thursday, WeekDay.Thursday },
            { DayOfWeek.Friday, WeekDay.Friday },
            { DayOfWeek.Saturday, WeekDay.Saturday },
            { DayOfWeek.Sunday, WeekDay.Sunday },
        };

        var todayWeekDay = mapping.GetValueOrDefault(today.DayOfWeek);
        var todayTasksWeeklyRepeatedQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Weekly && t.Meta != null && t.Meta.DaysOfWeek != null &&
                        t.Meta.DaysOfWeek.Length != 0
                        && t.StartDate <= DateOnly.FromDateTime(today)
                        && (today - t.StartDate.ToDateTime(TimeOnly.MinValue)).Days / 7 % t.Meta.Interval == 0
                        && t.Meta.DaysOfWeek.Contains(todayWeekDay));

        var todayTasksMonthlyRepeatedSameDayQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Monthly && t.Meta != null && t.Meta.Each != null
                        && t.StartDate <= DateOnly.FromDateTime(today)
                        && (((today.Year - t.StartDate.Year) * 12) + today.Month - t.StartDate.Month) %
                        t.Meta.Interval == 0
                        && today.Day == t.Meta.Each);


        var currentWeek = GetWeekOfMonth(today);
        var todayTasksMonthlyRepeatedSameWeekQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Monthly && t.Meta != null && t.Meta.Each == null
                        && t.Meta.Week != null && t.Meta.DayOfWeek != null
                        && t.StartDate <= DateOnly.FromDateTime(today)
                        && (((today.Year - t.StartDate.Year) * 12) + today.Month - t.StartDate.Month) %
                        t.Meta.Interval == 0
                        && t.Meta.DayOfWeek == todayWeekDay && t.Meta.Week == currentWeek);

        var todayTasksYearlyRepeatedQuery = context.Tasks.AsNoTracking()
            .Where(t => t.Frequency == Frequency.Yearly && t.Meta != null
                                                        && t.StartDate <= DateOnly.FromDateTime(today)
                                                        && (((today.Year - t.StartDate.Year) * 12) + today.Month -
                                                            t.StartDate.Month) / 12 % t.Meta.Interval == 0);

        return await todayTasksNeverRepeatedQuery
            .Concat(todayTasksDailyRepeatedQuery)
            .Concat(todayTasksWeeklyRepeatedQuery)
            .Concat(todayTasksMonthlyRepeatedSameDayQuery)
            .Concat(todayTasksMonthlyRepeatedSameWeekQuery)
            .Concat(todayTasksYearlyRepeatedQuery)
            .Select(task => new CreateTaskResponse(
                $"{task.Id}_{today.ToOADate()}",
                task.Title,
                today,
                task.DoneTasks.FirstOrDefault(t => t.DoneDate == DateOnly.FromDateTime(today)) != null ? "done" : "pending",
                null)).ToListAsync();
    }

    public static void MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("tasks", async (FoyerContext context) =>
        {
            var days = 3;
            var today = DateTime.Today;

            var tasks = await Get(context, today);

            for (var d = 1; d <= days; d++)
            {
                var futureTasks = await Get(context, today.AddDays(d));
                tasks = tasks.Concat(futureTasks);
            }

            return Results.Ok(tasks);
        }).RequireAuthorization();

        app.MapPost("tasks", async (CreateTaskRequest request, FoyerContext context) =>
        {
            var task = new Task
            {
                Title = request.label,
                StartDate = DateOnly.FromDateTime(request.date),
                Frequency = request.frequency,
                Meta = request.meta
            };
            await context.Tasks.AddAsync(task);
            await context.SaveChangesAsync();

            var response = new CreateTaskResponse(task.Id.ToString(), task.Title, task.StartDate
                    .ToDateTime(TimeOnly.MinValue)
                    .ToUniversalTime(),
                "pending",
                task.Meta);
            return Results.Created($"tasks/{task.Id}", response);
        }).RequireAuthorization();;

        app.MapDelete("tasks/{taskId:int}", async (int taskId, FoyerContext context) =>
        {
            await context.Tasks.Where(task => task.Id == taskId).ExecuteDeleteAsync();
            await context.SaveChangesAsync();

            return Results.NoContent();
        });
        
        app.MapPatch($"tasks/{{taskId:int}}", async (int taskId, FoyerContext context) => {
            var task = await  context.Tasks.FindAsync(taskId);
            if (task == null)
            {
                return Results.NotFound();
            }

            var done = new DoneTask
            {
                TaskId = task.Id,
                DoneDate = DateOnly.FromDateTime(DateTime.Now)
            };
            await context.DoneTasks.AddAsync(done);
            await context.SaveChangesAsync();
            
            return Results.NoContent();
        }).RequireAuthorization();;
    }
}