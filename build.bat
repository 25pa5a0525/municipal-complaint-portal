@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo  MUNICIPAL COMPLAINT REGISTRATION PORTAL - PRODUCTION BUILD
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js (version 18 or newer) from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js environment detected:
node -v
echo.

:: 2. Check and install Server dependencies
echo [2/4] Verifying backend dependencies...
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
) else (
    echo Backend dependencies are already installed.
)
echo.

:: 3. Check and install Client dependencies
echo [3/4] Verifying frontend dependencies...
if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
) else (
    echo Frontend dependencies are already installed.
)
echo.

:: 4. Build the React frontend with Vite
echo [4/4] Building production React application with Vite...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ====================================================================
echo  BUILD COMPLETE!
echo ====================================================================
echo The production frontend has been built into: client\dist
echo Express backend is pre-configured to serve this production build.
echo.
echo You can now run 'start.bat' to launch the entire portal on:
echo   http://localhost:5000
echo ====================================================================
echo.
pause
