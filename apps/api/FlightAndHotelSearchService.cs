using System.Text.Json;
using Amazon.BedrockRuntime;
using Microsoft.Extensions.Logging;

namespace TravelExperience.Api;

public class FlightAndHotelSearchService
{
    private readonly AmazonBedrockRuntimeClient _bedrockClient;
    private readonly string _modelId;

    public FlightAndHotelSearchService(AmazonBedrockRuntimeClient bedrockClient, string modelId)
    {
        _bedrockClient = bedrockClient;
        _modelId = modelId;
    }

    public async Task<string> SearchFlightsAsync(FlightSearchRequest request, ILogger logger, CancellationToken cancellationToken)
    {
        var prompt = $@"
You are a flight search API. Generate a JSON array of 5 to 8 realistic flights from '{request.From}' to '{request.To}' on '{request.Date}' for {request.Passengers} passengers in {request.Class} class. 
Include realistic airlines in India, flight numbers, departure and arrival times, and prices in INR based on typical realistic values.
Include a bookingUrl pointing to Skyscanner search.

Return strictly a raw JSON array matching this exact schema:
[
  {{
    ""id"": 1,
    ""airline"": ""string"",
    ""flightNo"": ""string"",
    ""dep"": ""string (e.g. 08:00 AM)"",
    ""arr"": ""string (e.g. 10:30 AM)"",
    ""duration"": ""string (e.g. 2h 30m)"",
    ""durationMins"": number,
    ""price"": number,
    ""type"": ""string (Non-stop or 1 Stop)"",
    ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/""
  }}
]
Do not include any markdown blocks, introductory text, or explanatory text. Just the raw JSON array.
";
        try
        {
            var response = await BedrockClient.InvokeClaudeAsync(_bedrockClient, _modelId, prompt, 2000, cancellationToken);
            var jsonStart = response.IndexOf('[');
            var jsonEnd = response.LastIndexOf(']');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                return response.Substring(jsonStart, jsonEnd - jsonStart + 1);
            }
            return response;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Bedrock flight search failed (likely AWS credentials expired). Falling back to mock data.");
            return $@"
[
  {{ ""id"": 1, ""airline"": ""Indigo"", ""flightNo"": ""6E-101"", ""dep"": ""08:00 AM"", ""arr"": ""10:30 AM"", ""duration"": ""2h 30m"", ""durationMins"": 150, ""price"": 5400, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 2, ""airline"": ""Vistara"", ""flightNo"": ""UK-902"", ""dep"": ""11:15 AM"", ""arr"": ""01:50 PM"", ""duration"": ""2h 35m"", ""durationMins"": 155, ""price"": 6800, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 3, ""airline"": ""Air India"", ""flightNo"": ""AI-404"", ""dep"": ""04:45 PM"", ""arr"": ""07:20 PM"", ""duration"": ""2h 35m"", ""durationMins"": 155, ""price"": 6100, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 4, ""airline"": ""SpiceJet"", ""flightNo"": ""SG-211"", ""dep"": ""08:30 PM"", ""arr"": ""11:00 PM"", ""duration"": ""2h 30m"", ""durationMins"": 150, ""price"": 4900, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 5, ""airline"": ""Akasa Air"", ""flightNo"": ""QP-132"", ""dep"": ""06:10 AM"", ""arr"": ""08:20 AM"", ""duration"": ""2h 10m"", ""durationMins"": 130, ""price"": 5200, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 6, ""airline"": ""Air India Express"", ""flightNo"": ""IX-505"", ""dep"": ""01:00 PM"", ""arr"": ""05:00 PM"", ""duration"": ""4h 00m"", ""durationMins"": 240, ""price"": 4100, ""type"": ""1 Stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 7, ""airline"": ""Indigo"", ""flightNo"": ""6E-882"", ""dep"": ""09:45 PM"", ""arr"": ""11:55 PM"", ""duration"": ""2h 10m"", ""durationMins"": 130, ""price"": 4800, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }},
  {{ ""id"": 8, ""airline"": ""Vistara"", ""flightNo"": ""UK-820"", ""dep"": ""07:00 AM"", ""arr"": ""09:30 AM"", ""duration"": ""2h 30m"", ""durationMins"": 150, ""price"": 7200, ""type"": ""Non-stop"", ""bookingUrl"": ""https://www.skyscanner.co.in/transport/flights/{request.From}/{request.To}/{request.Date}/"" }}
]
";
        }
    }

    public async Task<string> SearchHotelsAsync(HotelSearchRequest request, ILogger logger, CancellationToken cancellationToken)
    {
        var prompt = $@"
You are a hotel booking API. Generate a JSON array of 5 to 8 realistic hotels in '{request.City}' for check-in on '{request.CheckIn}' and check-out on '{request.CheckOut}' for {request.Guests} guests in {request.Rooms} rooms. 
Include realistic hotel names, ratings, reviews, locations, and prices in INR based on typical values.
Include a bookingUrl pointing to Booking.com.

Return strictly a raw JSON array matching this exact schema:
[
  {{
    ""id"": 1,
    ""name"": ""string"",
    ""rating"": number (e.g. 4.5),
    ""reviews"": number,
    ""location"": ""string"",
    ""price"": number,
    ""features"": [""string"", ""string""],
    ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}""
  }}
]
Do not include any markdown blocks, introductory text, or explanatory text. Just the raw JSON array.
";
        try
        {
            var response = await BedrockClient.InvokeClaudeAsync(_bedrockClient, _modelId, prompt, 2000, cancellationToken);
            var jsonStart = response.IndexOf('[');
            var jsonEnd = response.LastIndexOf(']');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                return response.Substring(jsonStart, jsonEnd - jsonStart + 1);
            }
            return response;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Bedrock hotel search failed (likely AWS credentials expired). Falling back to mock data.");
            return $@"
[
  {{ ""id"": 1, ""name"": ""Taj Oceanic Resort & Spa"", ""rating"": 4.8, ""reviews"": 342, ""location"": ""Beachfront"", ""price"": 12500, ""features"": [""Pool"", ""Spa"", ""Free Breakfast""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 2, ""name"": ""The Grand Horizon"", ""rating"": 4.5, ""reviews"": 215, ""location"": ""City Center"", ""price"": 8200, ""features"": [""Gym"", ""Bar"", ""Free WiFi""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 3, ""name"": ""Boutique Heritage Villa"", ""rating"": 4.7, ""reviews"": 128, ""location"": ""Old Town"", ""price"": 6500, ""features"": [""Heritage"", ""Garden"", ""Pet Friendly""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 4, ""name"": ""Cozy Backpackers Hostel"", ""rating"": 4.3, ""reviews"": 540, ""location"": ""Downtown"", ""price"": 1200, ""features"": [""Shared Dorm"", ""Common Room""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 5, ""name"": ""Royal Palm Suites"", ""rating"": 4.9, ""reviews"": 410, ""location"": ""Luxury District"", ""price"": 15400, ""features"": [""Infinity Pool"", ""Butler""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 6, ""name"": ""Urban Budget Inn"", ""rating"": 3.8, ""reviews"": 89, ""location"": ""Station Road"", ""price"": 2100, ""features"": [""AC"", ""Free WiFi""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }},
  {{ ""id"": 7, ""name"": ""Sunrise Bay Hotel"", ""rating"": 4.2, ""reviews"": 305, ""location"": ""Sea View"", ""price"": 4500, ""features"": [""Sea View"", ""Restaurant""], ""bookingUrl"": ""https://www.booking.com/searchresults.html?ss={request.City}&checkin={request.CheckIn}&checkout={request.CheckOut}"" }}
]
";
        }
    }
}

public sealed record FlightSearchRequest(string From, string To, string Date, int Passengers, string Class);
public sealed record HotelSearchRequest(string City, string CheckIn, string CheckOut, int Guests, int Rooms);
