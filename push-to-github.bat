@echo off
setlocal enabledelayedexpansion

title Push Municipal Complaint Portal to GitHub

echo ====================================================================
echo  PUSH MUNICIPAL COMPLAINT PORTAL TO GITHUB
echo ====================================================================
echo.
echo This helper links your local Git repository to your GitHub account
echo so you can deploy to Render.com with a single click.
echo.

cd /d "%~dp0"

set /p GITHUB_URL="Enter your GitHub repository URL (e.g. https://github.com/username/repo.git): "

if "%GITHUB_URL%"=="" (
    echo [ERROR] No GitHub URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo [*] Setting branch to main...
git branch -M main

echo [*] Configuring remote origin...
git remote remove origin 2>nul
git remote add origin %GITHUB_URL%

echo [*] Pushing files to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ====================================================================
    echo  [✓] SUCCESS! Your code has been uploaded to GitHub!
    echo ====================================================================
    echo Next step: Go to https://dashboard.render.com/ and select your repo!
    echo ====================================================================
) else (
    echo.
    echo [!] Push failed. Please verify that:
    echo     1. The GitHub repository exists and is empty.
    echo     2. You are signed into Git/GitHub on your PC.
)

echo.
pause
