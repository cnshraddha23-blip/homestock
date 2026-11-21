@echo off
echo ============================================================
echo Starting HomeStock FastAPI Backend Server (Port 8000)...
echo ============================================================
cd /d "%~dp0"
set PYTHONPATH=%~dp0backend
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
