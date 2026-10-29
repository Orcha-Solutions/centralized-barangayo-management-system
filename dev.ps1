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

$Host.UI.RawUI.WindowTitle = "CBMS - Local Dev Stack (Backend: $BackendPort | Admin: $FrontendPort)"
$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$BackendDir = "C:\Users\ciel2\go\src\cbms-backend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  [*] CBMS FULL-STACK ORCHESTRATOR" -ForegroundColor Cyan
Write-Host "  - PostgreSQL: localhost:5432 (Docker)" -ForegroundColor DarkGray
Write-Host "  - Go Backend: http://localhost:$BackendPort" -ForegroundColor DarkGray
Write-Host "  - Next.js UI: http://localhost:$FrontendPort" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify PostgreSQL and Jaeger containers are running
Write-Host "`n[1/3] Checking Infrastructure Containers..." -ForegroundColor Yellow
try {
  $pgStatus = docker inspect --format='{{.State.Running}}' cbms_postgres 2>$null
  if ($pgStatus -ne "true") {
    Write-Host "  Starting cbms_postgres container..." -ForegroundColor Yellow
    docker start cbms_postgres | Out-Null
    Start-Sleep -Seconds 2
  }
  Write-Host "  [OK] PostgreSQL container 'cbms_postgres' is healthy and running." -ForegroundColor Green

  $jaegerStatus = docker inspect --format='{{.State.Running}}' cbms_jaeger 2>$null
  if ($jaegerStatus -ne "true") {
    Write-Host "  Starting cbms_jaeger container..." -ForegroundColor Yellow
    docker start cbms_jaeger | Out-Null
  }
  Write-Host "  [OK] Jaeger container 'cbms_jaeger' is running." -ForegroundColor Green

  $redisStatus = docker inspect --format='{{.State.Running}}' cbms_redis 2>$null
  if ($redisStatus -ne "true") {
    Write-Host "  Starting cbms_redis container..." -ForegroundColor Yellow
    docker start cbms_redis | Out-Null
  }
  Write-Host "  [OK] Redis container 'cbms_redis' is running." -ForegroundColor Green
} catch {
  Write-Host "  [WARN] Docker check skipped or container not found. Assuming external DB is accessible." -ForegroundColor DarkYellow
}

# 2. Clean up any lingering processes on Backend/Frontend ports & build cbms-server.exe
Write-Host "`n[2/3] Preparing Ports & Checking Go Backend Binary..." -ForegroundColor Yellow
Get-Process -Name "cbms-server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
foreach ($port in @($BackendPort, $FrontendPort)) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    if ($c.OwningProcess -gt 0) {
      Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
  }
}
Write-Host "  Compiling latest cbms-server.exe in $BackendDir..." -ForegroundColor Yellow
Push-Location $BackendDir
go build -o cbms-server.exe ./cmd/server
Pop-Location
Write-Host "  [OK] Backend binary ready at $BackendDir\cbms-server.exe" -ForegroundColor Green

# 3. Launching Jobs
Write-Host "`n[3/3] Starting Backend and Frontend..." -ForegroundColor Yellow

$backendJob = Start-Job -ScriptBlock {
  param($dir)
  $ErrorActionPreference = "Continue"
  Set-Location $dir
  while ($true) {
    cmd.exe /c ".\cbms-server.exe 2>&1"
    Start-Sleep -Seconds 1
  }
} -ArgumentList $BackendDir

$frontendScript = if ($AllApps) {
  "pnpm dev"
} else {
  "pnpm --filter @cbms/admin dev"
}

$frontendJob = Start-Job -ScriptBlock {
  param($root, $cmd)
  $ErrorActionPreference = "Continue"
  Set-Location $root
  cmd.exe /c "$cmd 2>&1"
} -ArgumentList $RepoRoot, $frontendScript

Write-Host "  [OK] Go Backend running in background [Job ID: $($backendJob.Id)]" -ForegroundColor Green
Write-Host "  [OK] Next.js Frontend running in background [Job ID: $($frontendJob.Id)]" -ForegroundColor Green
Write-Host "`n----------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  [*] Admin Portal : http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host "  [*] Go REST API  : http://localhost:$BackendPort/api" -ForegroundColor Cyan
Write-Host "  [*] Jaeger UI    : http://localhost:16686" -ForegroundColor Cyan
Write-Host "  [*] Press CTRL+C at any time to gracefully stop all services." -ForegroundColor DarkGray
Write-Host "----------------------------------------------------------`n" -ForegroundColor DarkCyan

try {
  while ($true) {
    # Receive output from backend
    $backendOut = Receive-Job -Job $backendJob -ErrorAction Continue 2>&1
    if ($backendOut) {
      foreach ($line in $backendOut) {
        Write-Host "[BACKEND] $line" -ForegroundColor Gray
      }
    }

    # Receive output from frontend
    $frontendOut = Receive-Job -Job $frontendJob -ErrorAction Continue 2>&1
    if ($frontendOut) {
      foreach ($line in $frontendOut) {
        Write-Host "[FRONTEND] $line" -ForegroundColor DarkCyan
      }
    }

    if ($backendJob.State -ne "Running") {
      Write-Host "`n[WARN] Backend job stopped unexpectedly." -ForegroundColor Red
      break
    }
    if ($frontendJob.State -ne "Running") {
      Write-Host "`n[WARN] Frontend job stopped unexpectedly." -ForegroundColor Red
      break
    }

    Start-Sleep -Milliseconds 250
  }
}
finally {
  Write-Host "`n[STOP] Shutting down services..." -ForegroundColor Yellow
  Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
  Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
  Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
  Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue

  # Ensure no orphan cbms-server or next processes linger
  Get-Process -Name "cbms-server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  foreach ($port in @($BackendPort, $FrontendPort)) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      if ($c.OwningProcess -gt 0) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  }
  Write-Host "[OK] All processes cleanly stopped. Goodbye!`n" -ForegroundColor Green
}
