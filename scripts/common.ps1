<#
.SYNOPSIS
    Common functions for RedSky environment setup
#>

function Test-Command {
    param([string]$cmd)
    try { Get-Command $cmd -ErrorAction Stop | Out-Null; return $true }
    catch { return $false }
}

function Assert-Dotnet {
    if (-not (Test-Command "dotnet")) {
        throw "Dotnet SDK is required. Install from https://dotnet.microsoft.com/download"
    }
}

function Assert-Node {
    if (-not (Test-Command "node")) {
        throw "Node.js is required. Install from https://nodejs.org/"
    }
}

function Set-EnvFile {
    param(
        [string]$path,
        [hashtable]$variables
    )
    $content = ""
    foreach ($key in $variables.Keys) {
        $content += "$key=$($variables[$key])\n"
    }
    Set-Content -Path $path -Value $content
}

function Invoke-Backend {
    param([string]$env = "Development")
    Push-Location "$PSScriptRoot/../backend"
    try {
        dotnet run --environment $env
    }
    finally {
        Pop-Location
    }
}

function Invoke-Frontend {
    param([string]$env = "development")
    Push-Location "$PSScriptRoot/../frontend"
    try {
        if ($env -eq "production") {
            npm run build
            npx serve -s build
        }
        else {
            npm start
        }
    }
    finally {
        Pop-Location
    }
}
