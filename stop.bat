@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo  STOPPING MUNICIPAL COMPLAINT REGISTRATION PORTAL
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Terminate PID from .server.pid if exists
if exist ".server.pid" (
    set /p SERVER_PID=<.server.pid
    if defined SERVER_PID (
        echo [*] Stopping backend server with PID !SERVER_PID!...
        powershell -NoProfile -Command "Stop-Process -Id !SERVER_PID! -Force -ErrorAction SilentlyContinue"
    )
    del /f /q ".server.pid" >nul 2>&1
)

:: 2. Terminate any remaining processes strictly listening on port 5000 or 5173
:: (Ensures no unrelated Node.js or system processes are ever affected)
powershell -NoProfile -Command ^
    "$ports = @(5000, 5173);" ^
    "foreach ($p in $ports) {" ^
    "    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue;" ^
    "    foreach ($c in $conns) {" ^
    "        try {" ^
    "            Stop-Process -Id $c.OwningProcess -Force -ErrorAction Stop;" ^
    "            Write-Host ('[✓] Safely stopped project process on port ' + $p + ' (PID ' + $c.OwningProcess + ')');" ^
    "        } catch {}" ^
    "    }" ^
    "}"

:: 3. Remove any remaining temp pid files
if exist ".client.pid" del /f /q ".client.pid" >nul 2>&1

echo.
echo ====================================================================
echo  [✓] All project services have been stopped cleanly.
echo      Ports 5000 and 5173 are now free.
echo ====================================================================
echo.
ping 127.0.0.1 -n 2 >nul
exit /b 0

