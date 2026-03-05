# Activate virtual environment
& ./backend/.venv/Scripts/Activate.ps1

# Start uvicorn from the backend directory
Set-Location backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
