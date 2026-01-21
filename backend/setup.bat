@echo off
echo ============================================================
echo MyClinic Backend - Quick Start Setup
echo ============================================================
echo.

:: Check if .env exists
if exist .env (
    echo [OK] .env file found
) else (
    echo [!] .env file not found
    echo [*] Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [!] IMPORTANT: Please edit .env file and configure:
    echo     - MONGODB_URI
    echo     - JWT_SECRET
    echo     - SMS provider settings
    echo.
    pause
    exit /b
)

:: Check if node_modules exists
if exist node_modules (
    echo [OK] Dependencies installed
) else (
    echo [*] Installing dependencies...
    call npm install
    echo.
)

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Review .env configuration
echo 3. Start the server with: npm run dev
echo.
echo To test the API:
echo   node test-auth.js
echo.
echo Documentation:
echo   README.md - Setup guide
echo   API_DOCUMENTATION.md - API reference
echo   IMPLEMENTATION_SUMMARY.md - Complete overview
echo.
echo ============================================================
pause
