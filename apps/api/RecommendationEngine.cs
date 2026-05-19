namespace TravelExperience.Api;

internal sealed record DestinationRow(
  Guid Id,
  string Name,
  string Country,
  string Description,
  string ImageUrl,
  string[] Interests,
  int BudgetMin,
  int BudgetMax,
  int IdealDaysMin,
  int IdealDaysMax,
  int[] BestMonths,
  string[] TransportModes,
  string[] Highlights,
  int PricePerPerson,
  double? Latitude,
  double? Longitude);

internal sealed record RecommendationResult(
  Guid Id,
  string Name,
  string Country,
  string Description,
  string ImageUrl,
  string[] Interests,
  string[] Highlights,
  string[] AvailableTransport,
  int IdealDaysMin,
  int IdealDaysMax,
  int BudgetMin,
  int BudgetMax,
  int Score,
  string ScoreBreakdown,
  int PricePerPerson);

internal sealed class RecommendationEngine
{
  // City coordinates for proximity calculation
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

  private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
  {
    // Haversine formula for distance in kilometers
    var R = 6371; // Earth radius in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
    var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    return R * c;
  }

  public List<RecommendationResult> Score(
    List<DestinationRow> destinations,
    RecommendationRequest request,
    int travelMonth)
  {
    var results = new List<(DestinationRow dest, int score, string breakdown, bool isInternational, double distance)>();

    // Determine if budget allows international travel (₹80,000+ per person)
    bool canAffordInternational = request.BudgetMax >= 80000;

    // Get source city coordinates
    CityCoordinates.TryGetValue(request.SourceCity, out var sourceCoords);

    foreach (var dest in destinations)
    {
      int score = 0;
      var reasons = new List<string>();
      bool isInternational = dest.Country != "India";

      // Skip international destinations if budget is too low
      if (isInternational && !canAffordInternational) continue;

      // 1. Budget fit (25 pts)
      bool budgetFit = dest.BudgetMin <= request.BudgetMax && dest.BudgetMax >= request.BudgetMin;
      if (budgetFit)
      {
        score += 25;
        reasons.Add("budget");
      }
      else continue; // hard filter — skip if budget doesn't overlap

      // 2. Interest match (30 pts — STRICT: must match at least one interest)
      var matchedInterests = dest.Interests.Intersect(request.Interests, StringComparer.OrdinalIgnoreCase).ToList();
      if (matchedInterests.Count == 0) continue; // STRICT FILTER: skip if no interest match
      
      int interestScore = Math.Min(matchedInterests.Count * 10, 30);
      score += interestScore;
      reasons.Add($"interests({string.Join(",", matchedInterests)})");

      // 3. Season suitability (20 pts)
      if (dest.BestMonths.Contains(travelMonth))
      {
        score += 20;
        reasons.Add("season");
      }
      else score += 5; // partial — can still visit off-season

      // 4. Duration fit (15 pts)
      bool durationFit = request.Days >= dest.IdealDaysMin && request.Days <= dest.IdealDaysMax + 2;
      if (durationFit)
      {
        score += 15;
        reasons.Add("duration");
      }
      else if (request.Days >= dest.IdealDaysMin - 1)
      {
        score += 7; // close enough
      }

      // 5. Transport feasibility (10 pts)
      var matchedTransport = dest.TransportModes.Intersect(request.TransportModes, StringComparer.OrdinalIgnoreCase).ToList();
      if (matchedTransport.Count > 0)
      {
        score += 10;
        reasons.Add($"transport({string.Join(",", matchedTransport)})");
      }
      else continue; // hard filter — no feasible transport

      // 6. Proximity bonus for domestic destinations (up to 15 pts based on distance)
      double distance = double.MaxValue;
      if (!isInternational && sourceCoords != default && dest.Latitude.HasValue && dest.Longitude.HasValue)
      {
        distance = CalculateDistance(sourceCoords.lat, sourceCoords.lon, dest.Latitude.Value, dest.Longitude.Value);
        
        // Proximity scoring: closer = higher score
        // < 300km: 15 pts, 300-600km: 10 pts, 600-1000km: 5 pts, >1000km: 2 pts
        if (distance < 300)
        {
          score += 15;
          reasons.Add($"nearby({(int)distance}km)");
        }
        else if (distance < 600)
        {
          score += 10;
          reasons.Add($"close({(int)distance}km)");
        }
        else if (distance < 1000)
        {
          score += 5;
          reasons.Add($"reachable({(int)distance}km)");
        }
        else
        {
          score += 2;
          reasons.Add($"far({(int)distance}km)");
        }
      }
      else if (!isInternational)
      {
        score += 5; // default domestic bonus if no coordinates
        reasons.Add("domestic");
      }

      results.Add((dest, score, string.Join("|", reasons), isInternational, distance));
    }

    // Sort by score, then by distance (closer is better)
    var sortedResults = results
      .OrderByDescending(r => r.score)
      .ThenBy(r => r.distance)
      .ToList();

    // Smart mixing: prioritize domestic, but include 1-2 international if budget allows
    var finalResults = new List<(DestinationRow dest, int score, string breakdown, bool isInternational, double distance)>();
    var domesticResults = sortedResults.Where(r => !r.isInternational).ToList();
    var internationalResults = sortedResults.Where(r => r.isInternational).ToList();

    if (canAffordInternational && internationalResults.Count > 0)
    {
      // High budget: 3 domestic + 2 international
      finalResults.AddRange(domesticResults.Take(3));
      finalResults.AddRange(internationalResults.Take(2));
    }
    else
    {
      // Low/medium budget: 5 domestic
      finalResults.AddRange(domesticResults.Take(5));
    }

    return finalResults
      .OrderByDescending(r => r.score)
      .Take(5)
      .Select(r => new RecommendationResult(
        r.dest.Id,
        r.dest.Name,
        r.dest.Country,
        r.dest.Description,
        r.dest.ImageUrl,
        r.dest.Interests,
        r.dest.Highlights,
        r.dest.TransportModes.Intersect(request.TransportModes, StringComparer.OrdinalIgnoreCase).ToArray(),
        r.dest.IdealDaysMin,
        r.dest.IdealDaysMax,
        r.dest.BudgetMin,
        r.dest.BudgetMax,
        r.score,
        r.breakdown,
        r.dest.PricePerPerson))
      .ToList();
  }
}
