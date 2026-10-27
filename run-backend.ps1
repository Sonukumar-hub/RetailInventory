# Start StockSmart Spring Boot Backend
$env:JAVA_HOME = "C:\tools\jdk-21\jdk-21.0.12.1+1"
$env:PATH = "C:\tools\jdk-21\jdk-21.0.12.1+1\bin;C:\tools\apache-maven-3.9.6\bin;" + $env:PATH

# Load environment variables from .env if present
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($k, $v, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

Write-Host "Starting StockSmart Backend on http://localhost:8080/api..." -ForegroundColor Green
Write-Host "Swagger OpenAPI Docs available at http://localhost:8080/api/swagger-ui.html" -ForegroundColor Cyan

cd backend
mvn spring-boot:run
