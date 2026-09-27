API project (minimal) to expose Projects table

How it works
- A minimal ASP.NET Core 6.0 web app lives in /api
- It exposes GET /api/projects which returns all rows from dbo.Projects as JSON
- It also serves a simple UI at / (static files under wwwroot) which fetches /api/projects and renders cards

Setup
1. Update api/appsettings.json ConnectionStrings:DefaultConnection to point to your SQL Server instance. Example:
   "Server=localhost;Database=MyDb;User Id=sa;Password=Your_password123;TrustServerCertificate=True;"

2. From the api folder run:
   dotnet restore
   dotnet run --urls "http://localhost:5002"

3. Open http://localhost:5002 to view the UI, or call GET http://localhost:5002/api/projects

Notes
- The app uses Microsoft.Data.SqlClient. Ensure your database has the dbo.Projects table with columns: ProjectID (int PK), ProjectName (nvarchar), ProjectDescription (nvarchar(max)), ProjectStartDate (datetime), ProjectEndDate (datetime).
- For production, secure connection strings using secrets or environment variables.
- You can integrate this API into the static site or deploy to Azure App Service / Azure Functions as needed.
