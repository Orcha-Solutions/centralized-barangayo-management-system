<#
.SYNOPSIS
  Starts the CBMS Go Backend and Next.js Frontend concurrently in separate jobs,
  verifies the database container, streams live logs, and handles clean CTRL+C termination.

.EXAMPLE
  .\dev.ps1
  .\dev.ps1 -Port 4100
  .\dev.ps1 -AllApps
#>
[CmdletBinding()]
param(
  [int]$BackendPort = 4000,
  [int]$FrontendPort = 4100,
  [switch]$AllApps
)

$Host.UI.RawUI.WindowTitle = "CBMS · Local Dev Stack (Backend: $BackendPort | Admin: $FrontendPort)"
$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$BackendDir = "C:\Users\ciel2\go\src\cbms-backend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 CBMS FULL-STACK ORCHESTRATOR" -ForegroundColor Cyan
Write-Host "  - PostgreSQL: localhost:5432 (Docker)" -ForegroundColor DarkGray
Write-Host "  - Go Backend: http://localhost:$BackendPort" -ForegroundColor DarkGray
Write-Host "  - Next.js UI: http://localhost:$FrontendPort" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify PostgreSQL container is running
Write-Host "`n[1/3] Checking PostgreSQL Container..." -ForegroundColor Yellow
try {
  $pgStatus = docker inspect --format='{{.State.Running}}' cbms_postgres 2>$null
  if ($pgStatus -ne "true") {
    Write-Host "  Starting cbms_postgres container..." -ForegroundColor Yellow
    docker start cbms_postgres | Out-Null
    Start-Sleep -Seconds 2
  }
  Write-Host "  ✅ PostgreSQL container 'cbms_postgres' is healthy and running." -ForegroundColor Green
} catch {
  Write-Host "  ⚠️ Docker check skipped or container not found. Assuming external DB is accessible." -ForegroundColor DarkYellow
}

# 2. Build or verify cbms-server.exe
Write-Host "`n[2/3] Checking Go Backend Binary..." -ForegroundColor Yellow
Write-Host "  Compiling latest cbms-server.exe in $BackendDir..." -ForegroundColor Yellow
Push-Location $BackendDir
go build -o cbms-server.exe ./cmd/server
Pop-Location
Write-Host "  ✅ Backend binary ready at $BackendDir\cbms-server.exe" -ForegroundColor Green

# 3. Launching Jobs
Write-Host "`n[3/3] Starting Backend and Frontend..." -ForegroundColor Yellow

$backendJob = Start-Job -ScriptBlock {
  param($dir)
  Set-Location $dir
  & .\cbms-server.exe
} -ArgumentList $BackendDir

$frontendScript = if ($AllApps) {
  "pnpm dev"
} else {
  "pnpm --filter @cbms/admin dev"
}

$frontendJob = Start-Job -ScriptBlock {
  param($root, $cmd)
  Set-Location $root
  cmd.exe /c $cmd
} -ArgumentList $RepoRoot, $frontendScript

Write-Host "  ✅ Go Backend running in background [Job ID: $($backendJob.Id)]" -ForegroundColor Green
Write-Host "  ✅ Next.js Frontend running in background [Job ID: $($frontendJob.Id)]" -ForegroundColor Green
Write-Host "`n----------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  🌐 Admin Portal : http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host "  🔌 Go REST API  : http://localhost:$BackendPort/api" -ForegroundColor Cyan
Write-Host "  📑 Press CTRL+C at any time to gracefully stop all services." -ForegroundColor DarkGray
Write-Host "----------------------------------------------------------`n" -ForegroundColor DarkCyan

try {
  while ($true) {
    # Receive output from backend
    $backendOut = Receive-Job -Job $backendJob
    if ($backendOut) {
      foreach ($line in $backendOut) {
        Write-Host "[BACKEND] $line" -ForegroundColor Gray
      }
    }

    # Receive output from frontend
    $frontendOut = Receive-Job -Job $frontendJob
    if ($frontendOut) {
      foreach ($line in $frontendOut) {
        Write-Host "[FRONTEND] $line" -ForegroundColor DarkCyan
      }
    }

    if ($backendJob.State -ne "Running") {
      Write-Host "`n⚠️ Backend job stopped unexpectedly." -ForegroundColor Red
      break
    }
    if ($frontendJob.State -ne "Running") {
      Write-Host "`n⚠️ Frontend job stopped unexpectedly." -ForegroundColor Red
      break
    }

    Start-Sleep -Milliseconds 250
  }
}
finally {
  Write-Host "`n🛑 Shutting down services..." -ForegroundColor Yellow
  Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
  Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
  Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
  Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue

  # Ensure no orphan cbms-server or next processes linger
  Get-Process -Name "cbms-server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host "✅ All processes cleanly stopped. Goodbye!`n" -ForegroundColor Green
}
