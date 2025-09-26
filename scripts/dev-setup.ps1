<#
.SYNOPSIS
    Sets up development environment for RedSky.Upload
.DESCRIPTION
    Installs dependencies, configures environment variables, and starts services
#>

. $PSScriptRoot/common.ps1

# Verify prerequisites
Assert-Dotnet
Assert-Node

# Setup backend
Push-Location "$PSScriptRoot/../backend"
try {
    dotnet restore
    Set-EnvFile ".env" @{
        "ASPNETCORE_ENVIRONMENT" = "Development"
        "ConnectionStrings__Default" = "Data Source=app.db"
        "ApiKey" = "dev-secret-change-me"
    }
}
finally {
    Pop-Location
}

# Setup frontend
Push-Location "$PSScriptRoot/../frontend"
try {
    npm install
    Set-EnvFile ".env" @{
        "REACT_APP_API_URL" = "http://localhost:5034"
        "REACT_APP_API_KEY" = "dev-secret-change-me"
    }
}
finally {
    Pop-Location
}

Write-Host "✅ Development setup complete" -ForegroundColor Green
Write-Host "To start: ./scripts/start-dev.ps1" -ForegroundColor Cyan
