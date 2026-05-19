using Amazon.BedrockRuntime;
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

var awsRegion = builder.Configuration["AWS:Region"] ?? "us-east-1";
builder.Services.AddSingleton(new AmazonBedrockRuntimeClient(Amazon.RegionEndpoint.GetBySystemName(awsRegion)));
var bedrockModelId = builder.Configuration["AWS:Bedrock:ModelId"] ?? "anthropic.claude-3-haiku-20240307-v1:0";
builder.Services.AddSingleton(sp => new BedrockRecommendationService(sp.GetRequiredService<AmazonBedrockRuntimeClient>(), bedrockModelId));
builder.Services.AddSingleton(sp => new AIItineraryService(sp.GetRequiredService<AmazonBedrockRuntimeClient>(), bedrockModelId));

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

app.MapPost("/api/recommendations", async (RecommendationRequest request, HttpRequest httpRequest, PostgresAuthStore authStore, BedrockRecommendationService bedrockService, RecommendationEngine fallbackEngine, ILogger<Program> logger, CancellationToken cancellationToken) =>
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
  
  List<RecommendationResult> results;
  string engine = "ai";
  try
  {
    logger.LogInformation("Attempting AI recommendations with Bedrock...");
    results = await bedrockService.GetAIRecommendationsAsync(destinations, request, travelMonth, cancellationToken);
    if (results.Count == 0)
    {
      logger.LogWarning("Bedrock returned 0 results, falling back to rule-based");
      results = fallbackEngine.Score(destinations, request, travelMonth);
      engine = "rule-based";
    }
    else
    {
      logger.LogInformation("Successfully got {Count} AI recommendations", results.Count);
    }
  }
  catch (Exception ex)
  {
    logger.LogError(ex, "Bedrock failed, using rule-based fallback");
    results = fallbackEngine.Score(destinations, request, travelMonth);
    engine = "rule-based";
  }

  return Results.Ok(new { results, total = results.Count, engine });
});

app.MapPost("/api/itinerary/generate", async (ItineraryRequest request, HttpRequest httpRequest, PostgresAuthStore authStore, AIItineraryService itineraryService, ILogger<Program> logger, CancellationToken cancellationToken) =>
{
  var token = httpRequest.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "").Trim();
  if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
  var userId = await authStore.ResolveSessionAsync(token, cancellationToken);
  if (userId is null) return Results.Unauthorized();

  if (string.IsNullOrWhiteSpace(request.Destination))
    return Results.BadRequest(new { message = "Destination is required." });
  if (request.Days < 1 || request.Days > 15)
    return Results.BadRequest(new { message = "Duration must be between 1 and 15 days." });
  if (request.Interests.Length == 0)
    return Results.BadRequest(new { message = "At least one interest is required." });

  try
  {
    logger.LogInformation("Generating itinerary for {Destination}, {Days} days", request.Destination, request.Days);
    // Service tries Bedrock first, falls back to rule-based if Bedrock is unavailable
    var itinerary = await itineraryService.GenerateItineraryAsync(request, logger, cancellationToken);

    if (itinerary == null)
      return Results.Problem(detail: "Unable to generate itinerary. Please try again.", statusCode: 500, title: "Itinerary Error");

    await authStore.SaveItineraryAsync(userId.Value, itinerary, cancellationToken);
    logger.LogInformation("Itinerary saved for {Destination}", request.Destination);
    return Results.Ok(itinerary);
  }
  catch (Exception ex)
  {
    logger.LogError(ex, "Unexpected error generating itinerary");
    return Results.Problem(detail: ex.Message, statusCode: 500, title: "Itinerary Generation Failed");
  }
});

app.MapGet("/api/itinerary/recent", async (HttpRequest httpRequest, PostgresAuthStore authStore, CancellationToken cancellationToken) =>
{
  var token = httpRequest.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "").Trim();
  if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
  var userId = await authStore.ResolveSessionAsync(token, cancellationToken);
  if (userId is null) return Results.Unauthorized();

  var itineraries = await authStore.GetRecentItinerariesAsync(userId.Value, cancellationToken);
  return Results.Ok(new { itineraries });
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
  int NumberOfPeople,
  string[] Interests,
  string[] TransportModes);
