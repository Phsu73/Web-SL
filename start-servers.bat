@echo off
title Hackathon Game Servers
cls
color 0A

echo ====================================================================
echo      HACKATHON GAME - QUICK START
echo ====================================================================
echo.

echo [1/3] Starting Backend (Go Server)...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && echo [Backend] Installing dependencies... && go mod tidy && echo [Backend] Starting server... && go run ."

echo Waiting for backend to initialize...
timeout /t 5 >nul
echo.

echo [2/3] Starting Frontend (Vite)...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for frontend to start...
timeout /t 4 >nul
echo.

echo [3/3] Opening browser...
set "URL=http://localhost:5174"

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%URL%"
    goto end
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%URL%"
    goto end
)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "%URL%"
    goto end
)

start %URL%

:end
echo.
echo ====================================================================
echo    SERVERS STARTED! Keep terminal windows open.
echo ====================================================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5174
echo.
echo Press any key to exit this window only...
pause >nul
exit
