using System.Text;
using System.Text.Json;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;

namespace TravelExperience.Api;

/// <summary>
/// Shared helper for invoking Claude on AWS Bedrock.
/// Both BedrockRecommendationService and AIItineraryService reuse this
/// instead of duplicating the InvokeModelRequest boilerplate.
/// </summary>
internal static class BedrockClient
{
  public static async Task<string> InvokeClaudeAsync(
    AmazonBedrockRuntimeClient client,
    string modelId,
    string prompt,
    int maxTokens,
    CancellationToken cancellationToken)
  {
    var payload = new
    {
      anthropic_version = "bedrock-2023-05-31",
      max_tokens = maxTokens,
      messages = new[]
      {
        new { role = "user", content = prompt }
      }
    };

    var request = new InvokeModelRequest
    {
      ModelId = modelId,
      Body = new MemoryStream(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload))),
      ContentType = "application/json"
    };

    var response = await client.InvokeModelAsync(request, cancellationToken);
    using var reader = new StreamReader(response.Body);
    var responseBody = await reader.ReadToEndAsync(cancellationToken);

    var jsonDoc = JsonDocument.Parse(responseBody);
    var content = jsonDoc.RootElement.GetProperty("content")[0].GetProperty("text").GetString();
    return content ?? string.Empty;
  }
}
