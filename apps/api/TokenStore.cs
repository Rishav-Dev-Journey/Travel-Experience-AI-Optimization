using System.Collections.Concurrent;

namespace TravelExperience.Api;

internal sealed class TokenStore
{
  private readonly ConcurrentDictionary<string, TokenEntry> _tokens = new();

  public void Store(string token, OtpVerificationSuccess success)
  {
    _tokens[token] = new TokenEntry(success.UserId, success.ExpiresAt);
  }

  public Guid? Resolve(HttpRequest request)
  {
    var authHeader = request.Headers.Authorization.FirstOrDefault();
    if (authHeader is null || !authHeader.StartsWith("Bearer ")) return null;

    var token = authHeader["Bearer ".Length..].Trim();
    if (!_tokens.TryGetValue(token, out var entry)) return null;
    if (entry.ExpiresAt < DateTimeOffset.UtcNow)
    {
      _tokens.TryRemove(token, out _);
      return null;
    }

    return entry.UserId;
  }

  private sealed record TokenEntry(Guid UserId, DateTimeOffset ExpiresAt);
}
