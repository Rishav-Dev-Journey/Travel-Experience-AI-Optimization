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
  string[] Highlights);

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
  int Score,
  string ScoreBreakdown);

internal sealed class RecommendationEngine
{
  public List<RecommendationResult> Score(
    List<DestinationRow> destinations,
    RecommendationRequest request,
    int travelMonth)
  {
    var results = new List<(DestinationRow dest, int score, string breakdown)>();

    foreach (var dest in destinations)
    {
      int score = 0;
      var reasons = new List<string>();

      // 1. Budget fit (25 pts)
      bool budgetFit = dest.BudgetMin <= request.BudgetMax && dest.BudgetMax >= request.BudgetMin;
      if (budgetFit)
      {
        score += 25;
        reasons.Add("budget");
      }
      else continue; // hard filter — skip if budget doesn't overlap

      // 2. Interest match (30 pts — up to 10 per matching interest)
      var matchedInterests = dest.Interests.Intersect(request.Interests, StringComparer.OrdinalIgnoreCase).ToList();
      int interestScore = Math.Min(matchedInterests.Count * 10, 30);
      score += interestScore;
      if (matchedInterests.Count > 0) reasons.Add($"interests({string.Join(",", matchedInterests)})");

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

      results.Add((dest, score, string.Join("|", reasons)));
    }

    return results
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
        r.score,
        r.breakdown))
      .ToList();
  }
}
