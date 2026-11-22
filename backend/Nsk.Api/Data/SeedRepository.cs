using System.Collections.Concurrent;

namespace Nsk.Api;

public sealed class SeedRepository
{
    public SeedDocument Seed { get; }

    public SeedRepository(IHostEnvironment env, ILogger<SeedRepository> logger)
    {
        // При dotnet run ContentRoot — папка проекта, при публикации — bin; проверяем оба места.
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "seed.json"),
            Path.Combine(env.ContentRootPath, "Data", "seed.json"),
            Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "..", "..", "frontend", "src", "data", "seed.json")),
        };

        var path = candidates.FirstOrDefault(File.Exists)
            ?? throw new FileNotFoundException(
                $"Не найден seed.json. Проверены пути: {string.Join(", ", candidates)}. " +
                "Файл копируется из frontend/src/data/seed.json при сборке.",
                candidates[0]);

        var json = File.ReadAllText(path);
        Seed = System.Text.Json.JsonSerializer.Deserialize<SeedDocument>(
                   json,
                   new System.Text.Json.JsonSerializerOptions
                   {
                       PropertyNameCaseInsensitive = true,
                   })
               ?? throw new InvalidOperationException("Не удалось разобрать seed.json");

        logger.LogInformation(
            "Демо-данные загружены: {Places} мест, {Collections} подборок, {Routes} маршрутов, {Challenges} челленджей",
            Seed.Places.Count, Seed.Collections.Count, Seed.Routes.Count, Seed.Challenges.Count);
    }

    public Place? FindPlace(string id) =>
        Seed.Places.FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));
}

public sealed class CheckinService
{
    private readonly ConcurrentDictionary<string, ConcurrentBag<CheckinRecord>> _byDevice = new();

    public int Count(string deviceId) =>
        _byDevice.TryGetValue(deviceId, out var bag) ? bag.Count : 0;

    public IReadOnlyList<CheckinRecord> ForDevice(string deviceId) =>
        _byDevice.TryGetValue(deviceId, out var bag) ? bag.ToArray() : [];

    public CheckinResponse Add(string deviceId, Place place, double distance, double lat, double lng)
    {
        var bag = _byDevice.GetOrAdd(deviceId, _ => new ConcurrentBag<CheckinRecord>());
        bag.Add(new CheckinRecord(place.Id, lat, lng, distance, DateTimeOffset.UtcNow, deviceId));
        return new CheckinResponse(
            true,
            Math.Round(distance, 1),
            Geo.RadiusMeters,
            $"Чек-ин в «{place.ShortName}» засчитан",
            bag.Count);
    }
}

public static class Geo
{
    public const int RadiusMeters = 200;
    private const double EarthRadiusMeters = 6_371_000;

    public static double DistanceMeters(double lat1, double lng1, double lat2, double lng2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLng = ToRadians(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2))
                * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return 2 * EarthRadiusMeters * Math.Asin(Math.Min(1, Math.Sqrt(a)));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;
}
