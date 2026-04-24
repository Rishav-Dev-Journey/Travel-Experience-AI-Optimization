namespace TravelExperience.Api;

internal sealed record OtpChallenge(
  string ChallengeId,
  string Identifier,
  string Channel,
  string Code,
  DateTimeOffset CreatedAt,
  DateTimeOffset ExpiresAt,
  bool Consumed)
{
  public string MaskedDestination => Channel switch
  {
    "email" => MaskEmail(Identifier),
    "mobile" => MaskMobile(Identifier),
    _ => Identifier
  };

  private static string MaskEmail(string value)
  {
    var parts = value.Split('@', 2);

    if (parts.Length != 2 || string.IsNullOrWhiteSpace(parts[0]))
    {
      return value;
    }

    var local = parts[0];
    var maskedLocal = local.Length <= 2
      ? new string('*', local.Length)
      : $"{local[..1]}***{local[^1]}";

    return $"{maskedLocal}@{parts[1]}";
  }

  private static string MaskMobile(string value)
  {
    var digits = new string(value.Where(char.IsDigit).ToArray());

    if (digits.Length <= 4)
    {
      return value;
    }

    return $"***-***-{digits[^4..]}";
  }
}

internal sealed record OtpVerificationSuccess(
  string Token,
  Guid UserId,
  string Identifier,
  string Channel,
  DateTimeOffset ExpiresAt,
  bool IsNewUser);

internal abstract record OtpVerificationResult
{
  public sealed record Success(OtpVerificationSuccess Value) : OtpVerificationResult
  {
    public string Token => Value.Token;
    public string Identifier => Value.Identifier;
    public string Channel => Value.Channel;
    public DateTimeOffset ExpiresAt => Value.ExpiresAt;
  }

  public sealed record NotFound : OtpVerificationResult;
  public sealed record Expired : OtpVerificationResult;
  public sealed record InvalidCode : OtpVerificationResult;
}
