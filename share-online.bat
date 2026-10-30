@echo off
setlocal enabledelayedexpansion

title Municipal Complaint Portal - Live Public Tunnel

echo ====================================================================
echo  MUNICIPAL COMPLAINT REGISTRATION PORTAL - LIVE PUBLIC TUNNEL
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if server is already running on port 5000
powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { exit 0 } else { exit 1 }"
if %errorlevel% neq 0 (
    echo [*] Server is not running. Starting local server first...
    start "" cmd /c "start.bat"
    echo Waiting 5 seconds for server to initialize...
    ping 127.0.0.1 -n 6 >nul
) else (
    echo [✓] Local server is already running on port 5000.
)

echo.
echo [*] Requesting free public HTTPS live link via Localtunnel...
echo ====================================================================
echo  Your project will be accessible worldwide from any mobile phone,
echo  laptop, or external network at the generated URL below!
echo.
echo  [NOTE] When opening the link for the first time, click "Continue"
echo         or enter your public IP if prompted for security verification.
echo ====================================================================
echo.

npx --yes localtunnel --port 5000
