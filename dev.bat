@echo off
setlocal

echo ==========================================================
echo   CBMS FULL-STACK STARTER (Windows CMD / Batch)
echo ==========================================================

cd /d "%~dp0"

where wt.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
  echo Launching in Windows Terminal tabs...
  wt -w 0 new-tab -p "Command Prompt" -d "C:\Users\ciel2\go\src\cbms-backend" cmd /k "cbms-server.exe" ; split-pane -V -d "%~dp0" cmd /k "pnpm --filter @cbms/admin dev"
  goto done
)

echo Starting Go Backend in new window...
start "CBMS Go Backend (:4000)" /D "C:\Users\ciel2\go\src\cbms-backend" cmd /k "cbms-server.exe"

echo Starting Next.js Admin UI (:4100)...
start "CBMS Next.js Admin (:4100)" /D "%~dp0" cmd /k "pnpm --filter @cbms/admin dev"

:done
echo.
echo Started backend and frontend. Press any key to close this launcher...
pause >nul
