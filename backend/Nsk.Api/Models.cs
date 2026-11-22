using System.Text.Json.Serialization;

namespace Nsk.Api;

public sealed record Cover(string Pattern, string From, string To);

public sealed record Review(
    [property: JsonPropertyName("id")] string? Id,
    string Author,
    int Rating,
    string Date,
    string Text,
    string? Source);

public sealed record Place(
    string Id,
    string Name,
    string ShortName,
    string Category,
    string Type,
    List<string> Themes,
    List<string> Mood,
    List<string> Company,
    string Budget,
    string PriceText,
    string Duration,
    string DurationText,
    List<string> TimeOfDay,
    string Transport,
    string Address,
    double Lat,
    double Lng,
    string Hours,
    double Rating,
    int ReviewsCount,
    int Uniqueness,
    int Popularity,
    string Short,
    string Description,
    string Tips,
    string BestTime,
    Cover Cover,
    List<Review> Reviews);

public sealed record Collection(
    string Id,
    string Title,
    string Subtitle,
    string Description,
    List<string> PlaceIds,
    string Duration,
    int PlacesCount,
    Cover Cover,
    string Accent);

public sealed record Route(
    string Id,
    string Title,
    string Length,
    int DurationMin,
    double DistanceKm,
    List<string> PlaceIds,
    string Description,
    Cover Cover);

public sealed record Challenge(
    string Id,
    string Title,
    string Description,
    int Target,
    string Reward,
    string Partner,
    List<string> PlaceIds,
    Cover Cover,
    string Difficulty);

public sealed record SeedDocument(
    List<Place> Places,
    List<Collection> Collections,
    List<Route> Routes,
    List<Challenge> Challenges);

public sealed record CheckinRequest(string PlaceId, double Lat, double Lng, string? DeviceId);

public sealed record CheckinRecord(
    string PlaceId,
    double Lat,
    double Lng,
    double Distance,
    DateTimeOffset At,
    string DeviceId);

public sealed record CheckinResponse(
    bool Ok,
    double Distance,
    int Radius,
    string Message,
    int CheckedCount);

public sealed record ReviewRequest(string? Author, int Rating, string? Text);
