using Azure;
using Azure.Communication.Email;
using Azure.Identity;

namespace TravelExperience.Api;

internal interface IEmailOtpSender
{
  Task<EmailOtpDeliveryResult> SendOtpAsync(string emailAddress, string otpCode, CancellationToken cancellationToken = default);
}

internal sealed record EmailOtpDeliveryResult(bool Sent, string Message);

internal sealed class AzureEmailOtpSender : IEmailOtpSender
{
  private readonly EmailClient? _emailClient;
  private readonly bool _isEnabled;
  private readonly ILogger<AzureEmailOtpSender> _logger;
  private readonly string? _senderAddress;

  public AzureEmailOtpSender(IConfiguration configuration, ILogger<AzureEmailOtpSender> logger)
  {
    _logger = logger;

    _isEnabled = configuration.GetValue<bool?>("Azure:CommunicationServices:Enabled")
      ?? ParseEnabledEnvironmentValue(configuration["AZURE_COMMUNICATION_EMAIL_ENABLED"])
      ?? true;

    if (!_isEnabled)
    {
      _logger.LogInformation("Azure email sender is disabled by configuration.");
      return;
    }

    var connectionString = configuration["Azure:CommunicationServices:ConnectionString"]
      ?? configuration["AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING"];

    var endpoint = configuration["Azure:CommunicationServices:EmailEndpoint"]
      ?? configuration["AZURE_COMMUNICATION_EMAIL_ENDPOINT"];

    var accessKey = configuration["Azure:CommunicationServices:AccessKey"]
      ?? configuration["AZURE_COMMUNICATION_EMAIL_ACCESS_KEY"];

    _senderAddress = configuration["Azure:CommunicationServices:SenderAddress"]
      ?? configuration["AZURE_COMMUNICATION_EMAIL_SENDER"];

    var userAssignedClientId = configuration["Azure:CommunicationServices:UserAssignedClientId"]
      ?? configuration["AZURE_CLIENT_ID"];

    if (string.IsNullOrWhiteSpace(_senderAddress))
    {
      _logger.LogWarning("Azure email sender is not configured. Set Azure:CommunicationServices:SenderAddress.");
      return;
    }

    if (!string.IsNullOrWhiteSpace(connectionString))
    {
      if (TryParseConnectionString(connectionString, out var parsedEndpoint, out var parsedAccessKey))
      {
        _emailClient = new EmailClient(parsedEndpoint, new AzureKeyCredential(parsedAccessKey));
        _logger.LogInformation("Azure email sender configured using Communication Services connection string.");
        return;
      }

      _logger.LogWarning("Azure Communication Services connection string could not be parsed.");
    }

    if (!string.IsNullOrWhiteSpace(endpoint) && !string.IsNullOrWhiteSpace(accessKey))
    {
      _emailClient = new EmailClient(new Uri(endpoint), new AzureKeyCredential(accessKey));
      _logger.LogInformation("Azure email sender configured using endpoint and access key.");
      return;
    }

    if (!string.IsNullOrWhiteSpace(endpoint))
    {
      var credentialOptions = new DefaultAzureCredentialOptions();

      if (!string.IsNullOrWhiteSpace(userAssignedClientId))
      {
        credentialOptions.ManagedIdentityClientId = userAssignedClientId;
      }

      _emailClient = new EmailClient(new Uri(endpoint), new DefaultAzureCredential(credentialOptions));
      _logger.LogInformation("Azure email sender configured using managed identity.");
      return;
    }

    _logger.LogWarning("Azure email sender is not configured. Set a connection string, endpoint/access key, or managed identity endpoint.");
  }

  public async Task<EmailOtpDeliveryResult> SendOtpAsync(string emailAddress, string otpCode, CancellationToken cancellationToken = default)
  {
    if (!_isEnabled)
    {
      return new EmailOtpDeliveryResult(false, "Azure email sender is disabled by configuration.");
    }

    if (_emailClient is null || string.IsNullOrWhiteSpace(_senderAddress))
    {
      return new EmailOtpDeliveryResult(false, "Azure email sender is not configured. Using demo OTP mode.");
    }

    try
    {
      var subject = "Your Travel Experience OTP";
      var plainText = $"Your OTP is {otpCode}. It expires in 5 minutes.";
      var html = $"<p>Your OTP is <strong>{otpCode}</strong>.</p><p>It expires in 5 minutes.</p>";

      var content = new EmailContent(subject)
      {
        PlainText = plainText,
        Html = html
      };

      var recipients = new EmailRecipients(new List<EmailAddress>
      {
        new(emailAddress)
      });

      var message = new EmailMessage(_senderAddress, recipients, content);

      await _emailClient.SendAsync(WaitUntil.Started, message, cancellationToken);

      return new EmailOtpDeliveryResult(true, "OTP sent via Azure Communication Services Email.");
    }
    catch (Exception exception)
    {
      _logger.LogError(exception, "Failed to send OTP email via Azure Communication Services.");
      return new EmailOtpDeliveryResult(false, "Failed to send OTP email.");
    }
  }

  private static bool TryParseConnectionString(string connectionString, out Uri endpoint, out string accessKey)
  {
    endpoint = default!;
    accessKey = string.Empty;

    var parts = connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    string? endpointValue = null;
    string? accessKeyValue = null;

    foreach (var part in parts)
    {
      var keyValue = part.Split('=', 2, StringSplitOptions.TrimEntries);
      if (keyValue.Length != 2)
      {
        continue;
      }

      if (string.Equals(keyValue[0], "endpoint", StringComparison.OrdinalIgnoreCase))
      {
        endpointValue = keyValue[1];
      }
      else if (string.Equals(keyValue[0], "accesskey", StringComparison.OrdinalIgnoreCase))
      {
        accessKeyValue = keyValue[1];
      }
    }

    if (string.IsNullOrWhiteSpace(endpointValue) || string.IsNullOrWhiteSpace(accessKeyValue))
    {
      return false;
    }

    endpoint = new Uri(endpointValue);
    accessKey = accessKeyValue;
    return true;
  }

  private static bool? ParseEnabledEnvironmentValue(string? value)
  {
    if (string.IsNullOrWhiteSpace(value))
    {
      return null;
    }

    if (bool.TryParse(value, out var parsed))
    {
      return parsed;
    }

    return null;
  }
}
