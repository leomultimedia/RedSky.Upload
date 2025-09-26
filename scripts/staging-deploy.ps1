<#
.SYNOPSIS
    Deploys to staging environment
#>

. $PSScriptRoot/common.ps1

# Build backend
Push-Location "$PSScriptRoot/../backend"
try {
    dotnet publish -c Release -o ./publish
    Set-EnvFile "./publish/.env" @{
        "ASPNETCORE_ENVIRONMENT" = "Staging"
        "ConnectionStrings__Default" = "Server=staging-db;Database=redsky;User=redsky;Password=staging-pwd;"
    }
}
finally {
    Pop-Location
}

# Build frontend
Push-Location "$PSScriptRoot/../frontend"
try {
    npm install
    npm run build
    Set-EnvFile "./build/.env" @{
        "REACT_APP_API_URL" = "https://staging.api.redsky.com"
    }
}
finally {
    Pop-Location
}

Write-Host "✅ Staging artifacts ready in /publish and /build" -ForegroundColor Green
