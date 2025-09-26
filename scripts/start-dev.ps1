<#
.SYNOPSIS
    Starts both frontend and backend in development mode
.DESCRIPTION
    Launches backend API on port 5034 and frontend on port 3000
    with automatic reloading for both services
#>

. $PSScriptRoot/common.ps1

# Check if services are already running
$backendProcess = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*ExcelUpload*" }

$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -like "*react-scripts*" }

if ($backendProcess -or $frontendProcess) {
    Write-Host "⚠️  Services are already running:" -ForegroundColor Yellow
    if ($backendProcess) { Write-Host "  Backend (PID $($backendProcess.Id))" }
    if ($frontendProcess) { Write-Host "  Frontend (PID $($frontendProcess.Id))" }
    $choice = Read-Host "Restart services? (y/n)"
    if ($choice -ne 'y') { exit }
    
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}

# Start backend in a new window
$backendJob = Start-Process -FilePath "dotnet" -ArgumentList "run" -PassThru -WorkingDirectory "$PSScriptRoot/../backend" -WindowStyle Normal

# Start frontend in a new window 
$frontendJob = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WorkingDirectory "$PSScriptRoot/../frontend" -WindowStyle Normal

# Register processes for cleanup
Register-ObjectEvent -InputObject $backendJob -EventName Exited -Action {
    Write-Host "Backend process exited with code $($EventArgs.ExitCode)" -ForegroundColor Red
}

Register-ObjectEvent -InputObject $frontendJob -EventName Exited -Action {
    Write-Host "Frontend process exited with code $($EventArgs.ExitCode)" -ForegroundColor Red
}

# Display status
Write-Host @"
🚀 Development services started:

Backend:
  URL: http://localhost:5034
  PID: $($backendJob.Id)

Frontend:
  URL: http://localhost:3000  
  PID: $($frontendJob.Id)

Press Ctrl+C to stop monitoring
"@ -ForegroundColor Cyan

try {
    # Keep the script running while monitoring
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup on Ctrl+C
    Write-Host "`nShutting down services..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
}
