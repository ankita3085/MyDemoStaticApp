using System.Data;
using Microsoft.Data.SqlClient;
using Azure.Core;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

// Configuration: update appsettings.json or set environment variable ConnectionStrings__DefaultConnection
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

var app = builder.Build();

app.UseStaticFiles();

app.MapGet("/api/projects", async (IConfiguration config) =>
{
    var connStr = config.GetConnectionString("DefaultConnection");
    if (string.IsNullOrEmpty(connStr))
    {
        return Results.Problem("Connection string not configured. Set ConnectionStrings:DefaultConnection in appsettings.json or environment variables.");
    }

    var list = new List<ProjectDto>();
    try
    {
        await using var conn = new SqlConnection(connStr);

        // If the connection string requests Azure AD Default authentication, acquire an access token using DefaultAzureCredential
        if (connStr.Contains("Authentication=Active Directory Default", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var cred = new DefaultAzureCredential();
                var token = await cred.GetTokenAsync(new TokenRequestContext(new[] { "https://database.windows.net/.default" }));
                conn.AccessToken = token.Token;
            }
            catch (Exception tokenEx)
            {
                return Results.Problem($"Failed to acquire access token for Azure SQL: {tokenEx.Message}");
            }
        }

        await conn.OpenAsync();
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT ProjectID, ProjectName, ProjectDescription, ProjectStartDate, ProjectEndDate FROM dbo.Projects";
        cmd.CommandType = CommandType.Text;

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var p = new ProjectDto
            {
                ProjectID = reader.GetInt32(reader.GetOrdinal("ProjectID")),
                ProjectName = reader.IsDBNull(reader.GetOrdinal("ProjectName")) ? null : reader.GetString(reader.GetOrdinal("ProjectName")),
                ProjectDescription = reader.IsDBNull(reader.GetOrdinal("ProjectDescription")) ? null : reader.GetString(reader.GetOrdinal("ProjectDescription")),
                ProjectStartDate = reader.IsDBNull(reader.GetOrdinal("ProjectStartDate")) ? null : reader.GetDateTime(reader.GetOrdinal("ProjectStartDate")),
                ProjectEndDate = reader.IsDBNull(reader.GetOrdinal("ProjectEndDate")) ? null : reader.GetDateTime(reader.GetOrdinal("ProjectEndDate"))
            };
            list.Add(p);
        }
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }

    return Results.Ok(list);
});

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();

internal class ProjectDto
{
    public int ProjectID { get; set; }
    public string? ProjectName { get; set; }
    public string? ProjectDescription { get; set; }
    public DateTime? ProjectStartDate { get; set; }
    public DateTime? ProjectEndDate { get; set; }
}
