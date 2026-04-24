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

app.MapPost("/api/auth/verify-otp", async (VerifyOtpRequest request, OtpAuthService authService, CancellationToken cancellationToken) =>
{
  var result = await authService.VerifyChallengeAsync(request.ChallengeId.Trim(), request.Otp.Trim(), cancellationToken);

  return result switch
  {
    OtpVerificationResult.Success success => Results.Ok(new
    {
      token = success.Token,
      user = new
      {
        identifier = success.Identifier,
        channel = success.Channel
      },
      expiresAt = success.ExpiresAt
    }),
    OtpVerificationResult.NotFound => Results.NotFound(new { message = "OTP challenge not found or already used." }),
    OtpVerificationResult.Expired => Results.BadRequest(new { message = "OTP expired. Request a new one." }),
    OtpVerificationResult.InvalidCode => Results.BadRequest(new { message = "Invalid OTP." }),
    _ => Results.BadRequest(new { message = "Unable to verify OTP." })
  };
});

app.MapGet("/api/health", () => Results.Ok(new
{
  ok = true,
  service = "api"
}));

app.MapGet("/api/info", () => Results.Ok(new
{
  name = "Travel Experience Platform",
  api = "Travel Experience API",
  version = "1.0.0"
}));

app.Run();

internal sealed record RequestOtpRequest(string Identifier, string Channel);

internal sealed record VerifyOtpRequest(string ChallengeId, string Otp);
