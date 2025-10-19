namespace Foyer.Models;

public class DoneTask
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public DateOnly DoneDate { get; set; }
    
    public Task Task { get; set; }
}