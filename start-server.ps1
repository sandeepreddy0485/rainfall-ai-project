$BackendDir = "c:\Users\yaram\Desktop\ai-rainfall-system\backend"
Push-Location $BackendDir
Write-Host "Starting uvicorn from: $(Get-Location)"
Write-Host "Python executable: $(python --version)"
Write-Host ""
try {
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} finally {
    Pop-Location
}

