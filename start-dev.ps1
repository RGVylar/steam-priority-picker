# Start both backend and frontend servers for development

Write-Host "Starting Steam Priority Picker..." -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "Starting backend on http://localhost:8000" -ForegroundColor Cyan
$backend = "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backend

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Cyan
$frontend = "cd '$PSScriptRoot\web'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontend

Write-Host ""
Write-Host "Both servers starting!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
