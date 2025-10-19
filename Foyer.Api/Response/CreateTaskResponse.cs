using Foyer.Models;

namespace Foyer.Response;

public record CreateTaskResponse(string id, string label, DateTime date, string state, Meta? Meta);