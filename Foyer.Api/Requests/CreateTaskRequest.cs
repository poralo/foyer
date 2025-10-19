using Foyer.Models;

namespace Foyer.Requests;

public record CreateTaskRequest(string label, DateTime date, Frequency frequency, Meta? meta);