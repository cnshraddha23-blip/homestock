@echo off
echo ============================================================
echo Starting HomeStock Full-Stack Application...
echo ============================================================
start "HomeStock Backend (Port 8000)" "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "HomeStock Frontend (Port 5173)" "%~dp0start_frontend.bat"
echo.
echo HomeStock is launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Web App: http://localhost:5173
echo.
pause
