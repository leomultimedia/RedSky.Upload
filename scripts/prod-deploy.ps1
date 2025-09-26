<#
.SYNOPSIS
    Production deployment script
.NOTES
    Requires Azure CLI for deployment
#>

. $PSScriptRoot/common.ps1

# Verify Azure CLI
if (-not (Test-Command "az")) {
    throw "Azure CLI required. Install from https://aka.ms/installazurecli"
}

# Environment checks
$envVars = @{
    "AZURE_RESOURCE_GROUP" = $env:AZURE_RESOURCE_GROUP
    "AZURE_APP_NAME" = $env:AZURE_APP_NAME
}

foreach ($key in $envVars.Keys) {
    if (-not $envVars[$key]) {
        throw "Missing required environment variable: $key"
    }
}

# Deployment
Push-Location "$PSScriptRoot/../backend"
try {
    dotnet publish -c Release -o ./publish
    az webapp deploy `
        --resource-group $env:AZURE_RESOURCE_GROUP `
        --name $env:AZURE_APP_NAME `
        --src-path ./publish `
        --type zip
}
finally {
    Pop-Location
}

Write-Host "✅ Production deployment complete" -ForegroundColor Green
