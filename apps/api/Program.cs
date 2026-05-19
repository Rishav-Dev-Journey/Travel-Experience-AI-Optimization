using Npgsql;
using TravelExperience.Api;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres")
  ?? builder.Configuration["POSTGRES_CONNECTION_STRING"]
  ?? "Host=localhost;Port=5432;Database=travel_experience";

builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PostgresAuthStore>();
builder.Services.AddSingleton<OtpAuthService>();
builder.Services.AddSingleton<IEmailOtpSender, AzureEmailOtpSender>();
builder.Services.AddSingleton<RecommendationEngine>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
  options.AddPolicy("web", policy =>
  {
    policy.WithOrigins(
              "http://localhost:5080",
              "http://localhost:5173",
              "http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod();
  });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

await using (var scope = app.Services.CreateAsyncScope())
{
  var authStore = scope.ServiceProvider.GetRequiredService<PostgresAuthStore>();
  await authStore.InitializeAsync();
}

app.UseHttpsRedirection();
app.UseCors("web");

app.MapGet("/", () => Results.Ok(new
{
  service = "Travel Experience API",
  status = "running"
}));

app.MapPost("/api/auth/request-otp", async (RequestOtpRequest request, OtpAuthService authService, IEmailOtpSender emailOtpSender, IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
  if (!string.Equals(request.Channel?.Trim(), "email", StringComparison.OrdinalIgnoreCase))
  {
    return Results.BadRequest(new { message = "Only email OTP is enabled right now." });
  }

  if (!OtpAuthService.IsValidEmailIdentifier(request.Identifier))
  {
    return Results.BadRequest(new { message = "A valid email address is required." });
  }

  var challenge = await authService.CreateChallengeAsync(request.Identifier.Trim(), "email", cancellationToken);
  var delivery = await emailOtpSender.SendOtpAsync(challenge.Identifier, challenge.Code, cancellationToken);

  if (!delivery.Sent && !environment.IsDevelopment())
  {
    return Results.StatusCode(StatusCodes.Status502BadGateway);
  }

  if (environment.IsDevelopment())
  {
    return Results.Ok(new
    {
      challengeId = challenge.ChallengeId,
      expiresAt = challenge.ExpiresAt,
      deliveryChannel = challenge.Channel,
      destination = challenge.MaskedDestination,
      deliveryMessage = delivery.Message,
      demoOtp = challenge.Code,
      message = "OTP generated. Email delivery is enabled through Azure Communication Services."
    });
  }

  return Results.Ok(new
  {
    challengeId = challenge.ChallengeId,
    expiresAt = challenge.ExpiresAt,
    deliveryChannel = challenge.Channel,
    destination = challenge.MaskedDestination,
    deliveryMessage = delivery.Message,
    message = "OTP generated. Email delivery is enabled through Azure Communication Services."
  });
});

app.MapPost("/api/auth/verify-otp", async (VerifyOtpRequest request, OtpAuthService authService, PostgresAuthStore authStore, CancellationToken cancellationToken) =>
{
  var result = await authService.VerifyChallengeAsync(request.ChallengeId.Trim(), request.Otp.Trim(), cancellationToken);

  if (result is OtpVerificationResult.Success success)
  {
    await authStore.StoreSessionAsync(success.Token, success.Value.UserId, success.ExpiresAt, cancellationToken);
    return Results.Ok(new
    {
      token = success.Token,
      user = new { identifier = success.Identifier, channel = success.Channel },
      isNewUser = success.Value.IsNewUser,
      expiresAt = success.ExpiresAt
    });
  }

  return result switch
  {
    OtpVerificationResult.NotFound => Results.NotFound(new { message = "OTP challenge not found or already used." }),
    OtpVerificationResult.Expired => Results.BadRequest(new { message = "OTP expired. Request a new one." }),
    OtpVerificationResult.InvalidCode => Results.BadRequest(new { message = "Invalid OTP." }),
    _ => Results.BadRequest(new { message = "Unable to verify OTP." })
  };
});

app.MapGet("/api/health", () => Results.Ok(new { ok = true, service = "api" }));

app.MapGet("/api/info", () => Results.Ok(new
{
  name = "Travel Experience Platform",
  api = "Travel Experience API",
  version = "1.0.0"
}));

app.MapGet("/api/profile", async (HttpRequest request, PostgresAuthStore authStore, CancellationToken cancellationToken) =>
{
  var token = request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "").Trim();
  if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
  var userId = await authStore.ResolveSessionAsync(token, cancellationToken);
  if (userId is null) return Results.Unauthorized();

  var profile = await authStore.GetProfileAsync(userId.Value, cancellationToken);
  if (profile is null) return Results.Ok(new { name = (string?)null, homeCity = (string?)null, budget = (string?)null, interests = Array.Empty<string>() });

  return Results.Ok(new { name = profile.Name, homeCity = profile.HomeCity, budget = profile.Budget, interests = profile.Interests });
});

app.MapPut("/api/profile", async (UpsertProfileRequest request, HttpRequest httpRequest, PostgresAuthStore authStore, CancellationToken cancellationToken) =>
{
  var token = httpRequest.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "").Trim();
  if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
  var userId = await authStore.ResolveSessionAsync(token, cancellationToken);
  if (userId is null) return Results.Unauthorized();

  var profile = await authStore.UpsertProfileAsync(
    userId.Value,
    request.Name?.Trim(),
    request.HomeCity?.Trim(),
    request.Budget?.Trim(),
    request.Interests ?? [],
    cancellationToken);

  return Results.Ok(new { name = profile.Name, homeCity = profile.HomeCity, budget = profile.Budget, interests = profile.Interests });
});

app.MapPost("/api/recommendations", async (RecommendationRequest request, HttpRequest httpRequest, PostgresAuthStore authStore, RecommendationEngine engine, CancellationToken cancellationToken) =>
{
  var token = httpRequest.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "").Trim();
  if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
  var userId = await authStore.ResolveSessionAsync(token, cancellationToken);
  if (userId is null) return Results.Unauthorized();

  if (request.BudgetMin < 0 || request.BudgetMax <= request.BudgetMin)
    return Results.BadRequest(new { message = "Invalid budget range." });
  if (request.Days < 1 || request.Days > 30)
    return Results.BadRequest(new { message = "Duration must be between 1 and 30 days." });
  if (request.Interests.Length == 0 || request.TransportModes.Length == 0)
    return Results.BadRequest(new { message = "At least one interest and transport mode required." });

  var travelMonth = DateOnly.TryParse(request.StartDate, out var date) ? date.Month : DateTime.UtcNow.Month;
  var destinations = await authStore.GetAllDestinationsAsync(cancellationToken);
  var results = engine.Score(destinations, request, travelMonth);

  return Results.Ok(new { results, total = results.Count });
});

app.Run();

internal sealed record RequestOtpRequest(string Identifier, string Channel);
internal sealed record VerifyOtpRequest(string ChallengeId, string Otp);
internal sealed record UpsertProfileRequest(string? Name, string? HomeCity, string? Budget, string[]? Interests);
internal sealed record RecommendationRequest(
  string SourceCity,
  int BudgetMin,
  int BudgetMax,
  string StartDate,
  int Days,
  string[] Interests,
  string[] TransportModes);
