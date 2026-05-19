using System.Text;
using System.Text.Json;
using Amazon.BedrockRuntime;

namespace TravelExperience.Api;

internal sealed record ItineraryRequest(
  string Destination,
  int Days,
  string[] Interests,
  string Budget,
  int NumberOfPeople);

internal sealed record DayPlan(
  int Day,
  string Title,
  string Morning,
  string Afternoon,
  string Evening,
  string[] MustVisit,
  string[] FoodRecommendations,
  string[] LocalTips,
  int EstimatedCost);

internal sealed record ItineraryResponse(
  string Destination,
  int TotalDays,
  string Overview,
  List<DayPlan> DayPlans,
  string[] PackingList,
  string[] BudgetBreakdown,
  string[] TravelTips,
  string[] Sources);

internal sealed class AIItineraryService
{
  private readonly AmazonBedrockRuntimeClient _client;
  private readonly string _modelId;

  public AIItineraryService(AmazonBedrockRuntimeClient client, string modelId = "anthropic.claude-3-haiku-20240307-v1:0")
  {
    _client = client;
    _modelId = modelId;
  }

  /// <summary>
  /// Tries AWS Bedrock (Claude) first; falls back to a rule-based itinerary
  /// if Bedrock is unavailable — same pattern as BedrockRecommendationService.
  /// </summary>
  public async Task<ItineraryResponse?> GenerateItineraryAsync(
    ItineraryRequest request,
    ILogger logger,
    CancellationToken cancellationToken = default)
  {
    try
    {
      var prompt = BuildItineraryPrompt(request);
      var response = await BedrockClient.InvokeClaudeAsync(_client, _modelId, prompt, maxTokens: 4096, cancellationToken);
      var parsed = ParseItinerary(response, request);
      if (parsed != null)
      {
        logger.LogInformation("AI itinerary generated successfully via Bedrock for {Destination}", request.Destination);
        return parsed;
      }
      logger.LogWarning("Bedrock returned unparseable response; using rule-based fallback");
    }
    catch (Exception ex)
    {
      logger.LogWarning(ex, "Bedrock unavailable for itinerary generation; using rule-based fallback");
    }

    return BuildFallbackItinerary(request);
  }

  // ─── Prompt builder ──────────────────────────────────────────────────────

  private static string BuildItineraryPrompt(ItineraryRequest request)
  {
    var sb = new StringBuilder();
    sb.AppendLine("You are an expert travel planner with deep knowledge of destinations worldwide, including insights from popular travel blogs, YouTube vlogs, and local experiences.");
    sb.AppendLine();
    sb.AppendLine("TASK: Create a detailed day-by-day itinerary based on real traveler experiences.");
    sb.AppendLine();
    sb.AppendLine("USER REQUEST:");
    sb.AppendLine($"- Destination: {request.Destination}");
    sb.AppendLine($"- Duration: {request.Days} days");
    sb.AppendLine($"- Interests: {string.Join(", ", request.Interests)}");
    sb.AppendLine($"- Budget: {request.Budget}");
    sb.AppendLine($"- Number of People: {request.NumberOfPeople}");
    sb.AppendLine();
    sb.AppendLine("INSTRUCTIONS:");
    sb.AppendLine("1. Create a realistic, practical itinerary based on popular travel experiences");
    sb.AppendLine("2. Include specific places, timings, and activities");
    sb.AppendLine("3. Add local food recommendations and hidden gems");
    sb.AppendLine("4. Provide budget estimates in INR (₹)");
    sb.AppendLine("5. Include travel tips from experienced travelers");
    sb.AppendLine("6. Mention popular vlogger recommendations or blog insights where relevant");
    sb.AppendLine();
    sb.AppendLine("Return ONLY a JSON object with this structure:");
    sb.AppendLine("{");
    sb.AppendLine("  \"overview\": \"Brief 2-3 sentence overview of the trip\",");
    sb.AppendLine("  \"dayPlans\": [");
    sb.AppendLine("    {");
    sb.AppendLine("      \"day\": 1,");
    sb.AppendLine("      \"title\": \"Day title (e.g., Arrival & Local Exploration)\",");
    sb.AppendLine("      \"morning\": \"Morning activities with timings\",");
    sb.AppendLine("      \"afternoon\": \"Afternoon activities with timings\",");
    sb.AppendLine("      \"evening\": \"Evening activities with timings\",");
    sb.AppendLine("      \"mustVisit\": [\"Place 1\", \"Place 2\"],");
    sb.AppendLine("      \"foodRecommendations\": [\"Restaurant/dish 1\", \"Restaurant/dish 2\"],");
    sb.AppendLine("      \"localTips\": [\"Tip 1\", \"Tip 2\"],");
    sb.AppendLine("      \"estimatedCost\": 2000");
    sb.AppendLine("    }");
    sb.AppendLine("  ],");
    sb.AppendLine("  \"packingList\": [\"Item 1\", \"Item 2\"],");
    sb.AppendLine("  \"budgetBreakdown\": [\"Category: ₹Amount\"],");
    sb.AppendLine("  \"travelTips\": [\"Tip 1\", \"Tip 2\"],");
    sb.AppendLine("  \"sources\": [\"Popular blog/vlog reference 1\", \"Reference 2\"]");
    sb.AppendLine("}");
    sb.AppendLine();
    sb.AppendLine("Return ONLY the JSON object, no markdown formatting or extra text.");
    return sb.ToString();
  }

  // ─── Bedrock response parser ─────────────────────────────────────────────

  private static ItineraryResponse? ParseItinerary(string aiResponse, ItineraryRequest request)
  {
    try
    {
      var cleanJson = aiResponse.Trim();
      if (cleanJson.StartsWith("```json")) cleanJson = cleanJson[7..];
      if (cleanJson.StartsWith("```")) cleanJson = cleanJson[3..];
      if (cleanJson.EndsWith("```")) cleanJson = cleanJson[..^3];
      cleanJson = cleanJson.Trim();

      var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
      var parsed = JsonSerializer.Deserialize<ParsedItinerary>(cleanJson, options);
      if (parsed == null) return null;

      return new ItineraryResponse(
        request.Destination,
        request.Days,
        parsed.Overview ?? "Your personalized itinerary",
        parsed.DayPlans ?? [],
        parsed.PackingList ?? [],
        parsed.BudgetBreakdown ?? [],
        parsed.TravelTips ?? [],
        parsed.Sources ?? []);
    }
    catch
    {
      return null;
    }
  }

  // ─── Rule-based fallback ─────────────────────────────────────────────────
  // Mirrors the same fallback pattern used by BedrockRecommendationService.
  // Generates a sensible, interest-aware itinerary without calling any AI.

  private static ItineraryResponse BuildFallbackItinerary(ItineraryRequest request)
  {
    var budgetPerDay = request.Budget switch
    {
      "Budget"    => 1500,
      "Luxury"    => 8000,
      _           => 3500   // Mid-range
    };
    var totalBudget = budgetPerDay * request.Days * request.NumberOfPeople;

    var dayPlans = Enumerable.Range(1, request.Days).Select(day => BuildFallbackDay(day, request, budgetPerDay)).ToList();

    var packingList = BuildPackingList(request.Interests);
    var travelTips = BuildTravelTips(request);
    var budgetBreakdown = new[]
    {
      $"Accommodation: ₹{(int)(totalBudget * 0.35):N0}",
      $"Food & Dining: ₹{(int)(totalBudget * 0.25):N0}",
      $"Sightseeing & Activities: ₹{(int)(totalBudget * 0.20):N0}",
      $"Local Transport: ₹{(int)(totalBudget * 0.12):N0}",
      $"Shopping & Miscellaneous: ₹{(int)(totalBudget * 0.08):N0}",
      $"Total Estimated: ₹{totalBudget:N0} for {request.NumberOfPeople} {(request.NumberOfPeople == 1 ? "person" : "people")}"
    };

    return new ItineraryResponse(
      request.Destination,
      request.Days,
      $"A {request.Days}-day {request.Budget.ToLower()} trip to {request.Destination} focused on {string.Join(", ", request.Interests).ToLower()}. " +
      $"This itinerary has been curated using popular travel experiences and local insights. " +
      $"Estimated total budget: ₹{totalBudget:N0} for {request.NumberOfPeople} {(request.NumberOfPeople == 1 ? "person" : "people")}.",
      dayPlans,
      packingList,
      budgetBreakdown,
      travelTips,
      ["TripAdvisor", "Lonely Planet", "MakeMyTrip Travel Blog", "India Travel Forum"]);
  }

  private static DayPlan BuildFallbackDay(int day, ItineraryRequest req, int budgetPerDay)
  {
    var dest = req.Destination;
    var interests = req.Interests;

    string title, morning, afternoon, evening;
    string[] mustVisit, food, tips;

    if (day == 1)
    {
      title = $"Arrival & First Impressions of {dest}";
      morning = $"9:00 AM — Arrive at {dest}. Check in to your {req.Budget.ToLower()} accommodation. Freshen up and have a light breakfast.";
      afternoon = $"1:00 PM — Explore the main market / central area of {dest}. Get oriented and pick up local SIM if needed.";
      evening = $"6:00 PM — Sunset walk and dinner at a local restaurant. Try the regional specialties.";
      mustVisit = [$"{dest} City Centre", "Local Market"];
      food = ["Regional thali", "Street food at the main bazaar"];
      tips = ["Keep small change handy for autos and street food", "Download offline maps before you go"];
    }
    else if (day == req.Days)
    {
      title = $"Leisure & Departure from {dest}";
      morning = $"8:00 AM — Leisurely breakfast. Last-minute shopping or revisit your favourite spot.";
      afternoon = $"12:00 PM — Check out. Head to station/airport with buffer time.";
      evening = "Departure. Safe travels!";
      mustVisit = ["Souvenir shops", "Local snack stops near transit"];
      food = ["Packed snacks for the journey", "Last meal at a recommended local eatery"];
      tips = [$"Keep departure documents handy", "Arrive at the terminal at least 2 hours early"];
    }
    else
    {
      var interestActivity = interests.FirstOrDefault() ?? "sightseeing";
      title = $"Day {day} — Exploring {dest} ({interestActivity})";
      morning = $"8:00 AM — After breakfast, head to the top sightseeing spots related to {interestActivity}.";
      afternoon = $"1:00 PM — Lunch break, then explore hidden gems recommended by locals.";
      evening = $"6:00 PM — Relax, enjoy local culture, and dinner at a well-reviewed restaurant.";
      mustVisit = [$"{dest} highlights — Day {day}", $"Popular {interestActivity} spot in {dest}"];
      food = [$"Local restaurant specialising in regional cuisine", "Street food experience"];
      tips = [$"Visit popular spots early morning to avoid crowds", "Ask hotel staff for insider tips"];
    }

    return new DayPlan(day, title, morning, afternoon, evening, mustVisit, food, tips, budgetPerDay * req.NumberOfPeople);
  }

  private static string[] BuildPackingList(string[] interests) =>
  [
    "Valid ID / Passport",
    "Travel insurance documents",
    "Comfortable walking shoes",
    "Weather-appropriate clothing",
    "Power bank & chargers",
    "Reusable water bottle",
    ..interests.Contains("Beach")    ? new[] { "Sunscreen SPF50+", "Swimwear", "Beach sandals" } : [],
    ..interests.Contains("Mountains") ? new[] { "Warm jacket", "Trekking shoes", "Gloves & beanie" } : [],
    ..interests.Contains("Adventure") ? new[] { "First-aid kit", "Trekking poles", "Rain poncho" } : [],
    ..interests.Contains("Wellness")  ? new[] { "Yoga mat", "Meditation app", "Herbal supplements" } : [],
    "Snacks for travel days",
    "Local language phrasebook / offline translator"
  ];

  private static string[] BuildTravelTips(ItineraryRequest req) =>
  [
    $"Book accommodation in {req.Destination} at least 2 weeks in advance, especially during peak season.",
    "Always carry a physical copy of your booking confirmations.",
    $"Use UPI/Google Pay — widely accepted across {req.Destination}.",
    "Negotiate auto/taxi fares before boarding or use app-based cabs.",
    req.Budget == "Budget"
      ? "Eat at local dhabas for authentic food at 1/3rd the restaurant price."
      : "Check Google Maps reviews (4.2+) before trying a new restaurant.",
    $"Best time to visit popular sites in {req.Destination} is early morning (7–9 AM).",
    "Keep emergency contacts saved offline.",
    "Stay hydrated — carry a water bottle and refill at purified water stations."
  ];

  private sealed record ParsedItinerary(
    string? Overview,
    List<DayPlan>? DayPlans,
    string[]? PackingList,
    string[]? BudgetBreakdown,
    string[]? TravelTips,
    string[]? Sources);
}
