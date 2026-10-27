# StockSmart Database Initializer Script
param(
    [string]$Password = ""
)

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    Write-Error "MySQL binary not found at $mysqlPath"
    exit 1
}

# If password not passed as parameter, try reading from .env
if ([string]::IsNullOrWhiteSpace($Password)) {
    if (Test-Path "..\.env") {
        Get-Content "..\.env" | ForEach-Object {
            if ($_ -match "^DB_PASSWORD=(.*)$") {
                $Password = $matches[1].Trim()
            }
        }
    }
}

Write-Host "Connecting to MySQL at localhost:3306..." -ForegroundColor Cyan

$schemaFile = Join-Path $PSScriptRoot "schema.sql"
$dataFile = Join-Path $PSScriptRoot "sample-data.sql"

if ([string]::IsNullOrWhiteSpace($Password)) {
    $argList1 = "-u root < `"$schemaFile`""
    $argList2 = "-u root < `"$dataFile`""
} else {
    $argList1 = "-u root -p$Password < `"$schemaFile`""
    $argList2 = "-u root -p$Password < `"$dataFile`""
}

Write-Host "Executing schema.sql..." -ForegroundColor Yellow
$proc1 = Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$mysqlPath`" $argList1" -NoNewWindow -Wait -PassThru
if ($proc1.ExitCode -ne 0) {
    Write-Error "Failed to execute schema.sql. Please verify your MySQL password."
    exit $proc1.ExitCode
}

Write-Host "Executing sample-data.sql..." -ForegroundColor Yellow
$proc2 = Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$mysqlPath`" $argList2" -NoNewWindow -Wait -PassThru
if ($proc2.ExitCode -ne 0) {
    Write-Error "Failed to execute sample-data.sql."
    exit $proc2.ExitCode
}

Write-Host "Database 'stocksmart' initialized successfully with schema and demo data!" -ForegroundColor Green
