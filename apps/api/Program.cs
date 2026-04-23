var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("web");

app.MapGet("/", () => Results.Ok(new
{
    service = "Travel Experience API",
    status = "running"
}));

app.MapGet("/api/health", () => Results.Ok(new
{
    ok = true,
    service = "api"
}));

app.MapGet("/api/info", () => Results.Ok(new
{
    name = "Travel Experience Platform",
    api = "Travel Experience API",
    version = "1.0.0"
}));

app.Run();
