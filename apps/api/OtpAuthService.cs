using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace TravelExperience.Api;

internal sealed class OtpAuthService
{
  private readonly PostgresAuthStore _authStore;

  public OtpAuthService(PostgresAuthStore authStore)
  {
    _authStore = authStore;
  }

  public static bool IsValidChannel(string value)
  {
    return string.Equals(value, "email", StringComparison.OrdinalIgnoreCase)
      || string.Equals(value, "mobile", StringComparison.OrdinalIgnoreCase);
  }

  public static bool IsValidIdentifier(string value)
  {
    if (string.IsNullOrWhiteSpace(value))
    {
      return false;
    }

    if (value.Contains('@'))
    {
      try
      {
        _ = new MailAddress(value);
        return true;
      }
      catch
      {
        return false;
      }
    }

    return value.Count(char.IsDigit) >= 8;
  }

  public static bool IsValidEmailIdentifier(string value)
  {
    if (string.IsNullOrWhiteSpace(value))
    {
      return false;
    }

    try
    {
      _ = new MailAddress(value);
      return true;
    }
    catch
    {
      return false;
    }
  }

  public async Task<OtpChallenge> CreateChallengeAsync(string identifier, string channel, CancellationToken cancellationToken = default)
  {
    var now = DateTimeOffset.UtcNow;
    var challengeId = Guid.NewGuid().ToString("N");
    var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
    var expiresAt = now.AddMinutes(5);

    var user = await _authStore.UpsertUserAsync(identifier, channel, now, cancellationToken);
    await _authStore.InsertChallengeAsync(user, challengeId, ComputeCodeHash(challengeId, code), now, expiresAt, cancellationToken);

    var challenge = new OtpChallenge(
      ChallengeId: challengeId,
      Identifier: identifier,
      Channel: channel,
      Code: code,
      CreatedAt: now,
      ExpiresAt: expiresAt,
      Consumed: false);

    return challenge;
  }

  public async Task<OtpVerificationResult> VerifyChallengeAsync(string challengeId, string code, CancellationToken cancellationToken = default)
  {
    var now = DateTimeOffset.UtcNow;
    var outcome = await _authStore.TryConsumeChallengeAsync(challengeId, ComputeCodeHash(challengeId, code), now, cancellationToken);

    return outcome switch
    {
      ChallengeVerificationOutcome.Success success => new OtpVerificationResult.Success(new OtpVerificationSuccess(
        Token: Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
        UserId: success.UserId,
        Identifier: success.Identifier,
        Channel: success.Channel,
        ExpiresAt: success.SessionExpiresAt,
        IsNewUser: success.IsNewUser)),
      ChallengeVerificationOutcome.NotFound => new OtpVerificationResult.NotFound(),
      ChallengeVerificationOutcome.Expired => new OtpVerificationResult.Expired(),
      ChallengeVerificationOutcome.InvalidCode => new OtpVerificationResult.InvalidCode(),
      _ => new OtpVerificationResult.NotFound()
    };
  }

  private static string ComputeCodeHash(string challengeId, string code)
  {
    using var sha256 = SHA256.Create();
    var bytes = Encoding.UTF8.GetBytes($"{challengeId}:{code}");
    return Convert.ToBase64String(sha256.ComputeHash(bytes));
  }
}
