namespace HaiDangHomes.Domain.ValueObjects;

public record Address
{
    public string Street { get; init; } = string.Empty;
    public string? Ward { get; init; }
    public string? District { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; } = "Vietnam";
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    
    public string FullAddress => string.Join(", ", new[] { Street, Ward, District, City }.Where(x => !string.IsNullOrEmpty(x)));
}
