using System.Text;
using System.Text.Json;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;

namespace TravelExperience.Api;

internal sealed class BedrockRecommendationService
{
  private readonly AmazonBedrockRuntimeClient _client;
  private readonly string _modelId;

  public BedrockRecommendationService(AmazonBedrockRuntimeClient client, string modelId = "anthropic.claude-3-haiku-20240307-v1:0")
  {
    _client = client;
    _modelId = modelId;
  }

  public async Task<List<RecommendationResult>> GetAIRecommendationsAsync(
    List<DestinationRow> destinations,
    RecommendationRequest request,
    int travelMonth,
    CancellationToken cancellationToken = default)
  {
    var prompt = BuildPrompt(destinations, request, travelMonth);
    var response = await InvokeClaudeAsync(prompt, cancellationToken);
    return ParseRecommendations(response, destinations);
  }

  private string BuildPrompt(List<DestinationRow> destinations, RecommendationRequest request, int travelMonth)
  {
    var sb = new StringBuilder();
    sb.AppendLine("You are a travel recommendation expert with deep knowledge of Indian geography and local destinations.");
    sb.AppendLine();
    sb.AppendLine("CRITICAL INSTRUCTIONS:");
    sb.AppendLine("1. PRIORITIZE destinations that are geographically CLOSE to the source city");
    sb.AppendLine("2. For wildlife/nature interests, recommend nearby national parks, sanctuaries, and reserves");
    sb.AppendLine("3. Consider travel time and accessibility from source city");
    sb.AppendLine("4. Match user's interests STRICTLY - only recommend destinations with matching interests");
    sb.AppendLine("5. Respect transport mode constraints");
    sb.AppendLine();
    sb.AppendLine("USER PREFERENCES:");
    sb.AppendLine($"- Source City: {request.SourceCity}");
    sb.AppendLine($"- Budget Range: ₹{request.BudgetMin} - ₹{request.BudgetMax}");
    sb.AppendLine($"- Travel Start Date: {request.StartDate} (Month: {travelMonth})");
    sb.AppendLine($"- Duration: {request.Days} days");
    sb.AppendLine($"- Number of People: {request.NumberOfPeople}");
    sb.AppendLine($"- Interests: {string.Join(", ", request.Interests)}");
    sb.AppendLine($"- Transport Modes: {string.Join(", ", request.TransportModes)}");
    sb.AppendLine();
    sb.AppendLine("AVAILABLE DESTINATIONS:");
    
    for (int i = 0; i < destinations.Count; i++)
    {
      var dest = destinations[i];
      var distance = "";
      if (dest.Latitude.HasValue && dest.Longitude.HasValue)
      {
        var distKm = CalculateApproxDistance(request.SourceCity, dest.Latitude.Value, dest.Longitude.Value);
        if (distKm > 0) distance = $" [~{distKm}km from {request.SourceCity}]";
      }
      sb.AppendLine($"{i + 1}. {dest.Name}, {dest.Country}{distance}");
      sb.AppendLine($"   Budget: ₹{dest.BudgetMin}-₹{dest.BudgetMax}");
      sb.AppendLine($"   Ideal Days: {dest.IdealDaysMin}-{dest.IdealDaysMax}");
      sb.AppendLine($"   Best Months: {string.Join(", ", dest.BestMonths)}");
      sb.AppendLine($"   Interests: {string.Join(", ", dest.Interests)}");
      sb.AppendLine($"   Transport: {string.Join(", ", dest.TransportModes)}");
      sb.AppendLine($"   Highlights: {string.Join(", ", dest.Highlights)}");
      sb.AppendLine();
    }

    sb.AppendLine("TASK:");
    sb.AppendLine("Return ONLY a JSON array with the top 5 destination recommendations.");
    sb.AppendLine("SCORING CRITERIA:");
    sb.AppendLine("- Proximity to source city: 30 points (closer = higher score)");
    sb.AppendLine("- Interest match: 30 points (must match at least one interest)");
    sb.AppendLine("- Budget fit: 20 points");
    sb.AppendLine("- Season suitability: 10 points");
    sb.AppendLine("- Duration fit: 10 points");
    sb.AppendLine();
    sb.AppendLine("Each item must have:");
    sb.AppendLine("- destinationName: exact name from the list");
    sb.AppendLine("- score: integer 0-100");
    sb.AppendLine("- reason: brief explanation mentioning distance and why it's a good match (max 150 chars)");
    sb.AppendLine();
    sb.AppendLine("Example: [{\"destinationName\":\"Bandipur National Park\",\"score\":92,\"reason\":\"Only 176km away, perfect for wildlife, accessible by bus, fits budget\"}]");
    sb.AppendLine();
    sb.AppendLine("Return ONLY the JSON array, no other text.");

    return sb.ToString();
  }

  private static readonly Dictionary<string, (double lat, double lon)> CityCoordinates = new(StringComparer.OrdinalIgnoreCase)
  {
    ["Bengaluru"] = (12.9716, 77.5946),
    ["Bangalore"] = (12.9716, 77.5946),
    ["Delhi"] = (28.7041, 77.1025),
    ["Mumbai"] = (19.0760, 72.8777),
    ["Chennai"] = (13.0827, 80.2707),
    ["Kolkata"] = (22.5726, 88.3639),
    ["Hyderabad"] = (17.3850, 78.4867),
    ["Pune"] = (18.5204, 73.8567),
    ["Ahmedabad"] = (23.0225, 72.5714),
    ["Jaipur"] = (26.9124, 75.7873),
    ["Kochi"] = (9.9312, 76.2673),
  };

  private int CalculateApproxDistance(string sourceCity, double destLat, double destLon)
  {
    if (!CityCoordinates.TryGetValue(sourceCity, out var source)) return 0;
    
    var R = 6371; // Earth radius in km
    var dLat = (destLat - source.lat) * Math.PI / 180;
    var dLon = (destLon - source.lon) * Math.PI / 180;
    var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(source.lat * Math.PI / 180) * Math.Cos(destLat * Math.PI / 180) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
    var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    return (int)(R * c);
  }

  private async Task<string> InvokeClaudeAsync(string prompt, CancellationToken cancellationToken)
  {
    var payload = new
    {
      anthropic_version = "bedrock-2023-05-31",
      max_tokens = 1024,
      messages = new[]
      {
        new { role = "user", content = prompt }
      }
    };

    var request = new InvokeModelRequest
    {
      ModelId = _modelId,
      Body = new MemoryStream(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload))),
      ContentType = "application/json"
    };

    var response = await _client.InvokeModelAsync(request, cancellationToken);
    using var reader = new StreamReader(response.Body);
    var responseBody = await reader.ReadToEndAsync(cancellationToken);
    
    var jsonDoc = JsonDocument.Parse(responseBody);
    var content = jsonDoc.RootElement.GetProperty("content")[0].GetProperty("text").GetString();
    return content ?? "[]";
  }

  private List<RecommendationResult> ParseRecommendations(string aiResponse, List<DestinationRow> destinations)
  {
    try
    {
      var cleanJson = aiResponse.Trim();
      if (cleanJson.StartsWith("```json")) cleanJson = cleanJson[7..];
      if (cleanJson.StartsWith("```")) cleanJson = cleanJson[3..];
      if (cleanJson.EndsWith("```")) cleanJson = cleanJson[..^3];
      cleanJson = cleanJson.Trim();

      var aiResults = JsonSerializer.Deserialize<List<AIRecommendation>>(cleanJson);
      if (aiResults == null) return [];

      var results = new List<RecommendationResult>();
      foreach (var ai in aiResults.Take(5))
      {
        var dest = destinations.FirstOrDefault(d => 
          d.Name.Equals(ai.DestinationName, StringComparison.OrdinalIgnoreCase));
        
        if (dest != null)
        {
          results.Add(new RecommendationResult(
            dest.Id,
            dest.Name,
            dest.Country,
            dest.Description,
            dest.ImageUrl,
            dest.Interests,
            dest.Highlights,
            dest.TransportModes,
            dest.IdealDaysMin,
            dest.IdealDaysMax,
            dest.BudgetMin,
            dest.BudgetMax,
            ai.Score,
            ai.Reason,
            dest.PricePerPerson));
        }
      }
      return results;
    }
    catch
    {
      return [];
    }
  }

  private sealed record AIRecommendation(string DestinationName, int Score, string Reason);
}
