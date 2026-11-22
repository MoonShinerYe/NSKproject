using System.Collections.Concurrent;
using Nsk.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy => policy
        .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddSingleton<SeedRepository>();
builder.Services.AddSingleton<CheckinService>();
builder.Services.AddSingleton<ConcurrentDictionary<string, List<Review>>>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseCors("frontend");
app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api");

api.MapGet("/health", (SeedRepository repo) => Results.Ok(new
{
    status = "ok",
    places = repo.Seed.Places.Count,
    collections = repo.Seed.Collections.Count,
    routes = repo.Seed.Routes.Count,
    challenges = repo.Seed.Challenges.Count,
    radius = Geo.RadiusMeters,
    time = DateTimeOffset.UtcNow,
}));

api.MapGet("/places", (
    SeedRepository repo,
    string? q,
    string? budget,
    string? company,
    string? duration,
    string? category,
    string? theme,
    string? timeOfDay,
    string? transport,
    string? mood,
    string? sort) =>
{
    IEnumerable<Place> places = repo.Seed.Places;

    var budgets = Split(budget);
    if (budgets.Length > 0) places = places.Where(p => budgets.Contains(p.Budget));

    var companies = Split(company);
    if (companies.Length > 0) places = places.Where(p => p.Company.Any(companies.Contains));

    var durations = Split(duration);
    if (durations.Length > 0) places = places.Where(p => durations.Contains(p.Duration));

    var categories = Split(category);
    if (categories.Length > 0) places = places.Where(p => categories.Contains(p.Category));

    var themes = Split(theme);
    if (themes.Length > 0) places = places.Where(p => p.Themes.Any(themes.Contains));

    var times = Split(timeOfDay);
    if (times.Length > 0) places = places.Where(p => p.TimeOfDay.Any(times.Contains));

    var moods = Split(mood);
    if (moods.Length > 0) places = places.Where(p => p.Mood.Any(moods.Contains));

    var transports = Split(transport);
    if (transports.Length > 0)
    {
        places = places.Where(p => transports.Contains(p.Transport) || p.Transport == "both");
    }

    if (!string.IsNullOrWhiteSpace(q))
    {
        var needle = q.Trim();
        places = places.Where(p =>
            p.Name.Contains(needle, StringComparison.OrdinalIgnoreCase)
            || p.Short.Contains(needle, StringComparison.OrdinalIgnoreCase)
            || p.Description.Contains(needle, StringComparison.OrdinalIgnoreCase)
            || p.Address.Contains(needle, StringComparison.OrdinalIgnoreCase));
    }

    places = sort switch
    {
        "rating" => places.OrderByDescending(p => p.Rating).ThenByDescending(p => p.ReviewsCount),
        "unusual" => places.OrderByDescending(p => p.Uniqueness).ThenByDescending(p => p.Rating),
        _ => places.OrderByDescending(p => p.Popularity).ThenByDescending(p => p.Rating),
    };

    return Results.Ok(places.ToList());
});

api.MapGet("/places/{id}", (SeedRepository repo, string id) =>
{
    var place = repo.FindPlace(id);
    return place is null
        ? Results.NotFound(new { message = "Место не найдено" })
        : Results.Ok(place);
});

api.MapGet("/places/{id}/reviews", (
    SeedRepository repo,
    ConcurrentDictionary<string, List<Review>> added,
    string id) =>
{
    var place = repo.FindPlace(id);
    if (place is null) return Results.NotFound(new { message = "Место не найдено" });

    added.TryGetValue(id, out var local);
    var reviews = (local ?? []).Concat(place.Reviews).ToList();
    return Results.Ok(reviews);
});

api.MapPost("/places/{id}/reviews", (
    SeedRepository repo,
    ConcurrentDictionary<string, List<Review>> added,
    string id,
    ReviewRequest request) =>
{
    var place = repo.FindPlace(id);
    if (place is null) return Results.NotFound(new { message = "Место не найдено" });

    if (request.Rating is < 1 or > 5)
        return Results.BadRequest(new { message = "Оценка должна быть от 1 до 5" });

    var text = (request.Text ?? string.Empty).Trim();
    if (text.Length < 10)
        return Results.BadRequest(new { message = "Отзыв слишком короткий" });

    var review = new Review(
        Guid.NewGuid().ToString("N"),
        string.IsNullOrWhiteSpace(request.Author) ? "Гость" : request.Author!.Trim(),
        request.Rating,
        DateTime.UtcNow.ToString("yyyy-MM-dd"),
        text,
        "Вокруг НСК");

    var list = added.GetOrAdd(id, _ => []);
    lock (list)
    {
        list.Add(review);
    }

    return Results.Created($"/api/places/{id}/reviews/{review.Id}", review);
});

api.MapGet("/collections", (SeedRepository repo) => Results.Ok(repo.Seed.Collections));

api.MapGet("/collections/{id}", (SeedRepository repo, string id) =>
{
    var item = repo.Seed.Collections.FirstOrDefault(c => c.Id == id);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

api.MapGet("/routes", (SeedRepository repo, string? length) =>
{
    var items = repo.Seed.Routes.AsEnumerable();
    if (!string.IsNullOrWhiteSpace(length)) items = items.Where(r => r.Length == length);
    return Results.Ok(items.ToList());
});

api.MapGet("/routes/{id}", (SeedRepository repo, string id) =>
{
    var item = repo.Seed.Routes.FirstOrDefault(r => r.Id == id);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

api.MapGet("/challenges", (SeedRepository repo) => Results.Ok(repo.Seed.Challenges));

// Главная проверка проекта: чек-ин засчитывается только рядом с точкой.
api.MapPost("/checkins", (
    SeedRepository repo,
    CheckinService checkins,
    CheckinRequest request) =>
{
    var place = repo.FindPlace(request.PlaceId);
    if (place is null)
        return Results.NotFound(new { message = "Место не найдено" });

    var device = string.IsNullOrWhiteSpace(request.DeviceId) ? "anonymous" : request.DeviceId!;
    var distance = Geo.DistanceMeters(request.Lat, request.Lng, place.Lat, place.Lng);

    if (distance > Geo.RadiusMeters)
    {
        return Results.Ok(new CheckinResponse(
            false,
            Math.Round(distance, 1),
            Geo.RadiusMeters,
            $"Вы в {Math.Round(distance)} м от места. Нужно быть ближе {Geo.RadiusMeters} м.",
            checkins.Count(device)));
    }

    return Results.Ok(checkins.Add(device, place, distance, request.Lat, request.Lng));
});

api.MapGet("/checkins/{deviceId}", (CheckinService checkins, string deviceId) =>
    Results.Ok(checkins.ForDevice(deviceId)));

// SPA-фолбэк, если фронтенд собран в wwwroot (см. README: npm run build + копирование dist).
app.MapFallbackToFile("index.html");

app.Run();

static string[] Split(string? value) =>
    string.IsNullOrWhiteSpace(value)
        ? []
        : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
