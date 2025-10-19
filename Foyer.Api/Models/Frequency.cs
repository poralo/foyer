using System.Text.Json.Serialization;

namespace Foyer.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]  
public enum Frequency
{
    Never,
    Daily,
    Weekly,
    Monthly,
    Yearly,
}