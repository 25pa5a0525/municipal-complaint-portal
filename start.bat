@echo off
setlocal enabledelayedexpansion

title Municipal Complaint Registration Portal Server [PORT 5000]

echo ====================================================================
echo  MUNICIPAL COMPLAINT REGISTRATION PORTAL
echo  "Your Voice, Our Responsibility"
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check whether Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Node.js is required to run this application.
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js environment detected:
node -v
echo.

:: 2. Check whether dependencies are available
echo [*] Checking dependencies...

if not exist "server\node_modules" (
    echo [i] Server dependencies not found. Installing now...
    cd server
    call npm install
    cd ..
) else (
    echo [✓] Backend dependencies are available.
)

if not exist "client\node_modules" (
    echo [i] Frontend dependencies not found. Installing now...
    cd client
    call npm install
    cd ..
) else (
    echo [✓] Frontend dependencies are available.
)
echo.

:: 3. Initialize the SQLite database if required
echo [*] Initializing SQLite database and verifying sample records...
cd server
node scripts/init-db.js
if %errorlevel% neq 0 (
    echo [ERROR] Database initialization failed.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [✓] SQLite database ready at server\database\municipal.sqlite
echo.

:: 4. Check if production frontend build exists; if not, build it now
if not exist "client\dist\index.html" (
    echo [i] Production frontend build not found. Building with Vite now...
    cd client
    call npm run build
    cd ..
    echo [✓] Production frontend built successfully.
) else (
    echo [✓] Production frontend build verified.
)
echo.

:: Check if port 5000 is already in use by a previous instance
powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { exit 1 } else { exit 0 }"
if %errorlevel% equ 1 (
    echo [!] Port 5000 is already active. Stopping previous instance...
    call stop.bat >nul 2>&1
    ping 127.0.0.1 -n 3 >nul
)

echo ====================================================================
echo  LAUNCHING APPLICATION SERVICES
echo ====================================================================
echo  Citizen Portal       : http://localhost:5000
echo  Citizen Registration : http://localhost:5000/register
echo  Track Complaint      : http://localhost:5000/track
echo  City Dashboard       : http://localhost:5000/dashboard
echo  Administrator Login  : http://localhost:5000/admin/login
echo.
echo  Administrator Credentials:
echo    Username : admin
echo    Password : admin123
echo.
echo  [Tip] Keep this console window open while using the application.
echo        To stop the server anytime, press Ctrl+C or run 'stop.bat'.
echo ====================================================================
echo.

:: 6. Open default browser after a 2-second background delay
start "" cmd /c "ping 127.0.0.1 -n 3 >nul && start http://localhost:5000"

:: 5. Start the Express server in the current console window
cd server
node server.js
