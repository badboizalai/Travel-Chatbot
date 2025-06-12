# TravelMate Health Check Script (Windows PowerShell)

Write-Host "🏥 TravelMate System Health Check" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Backend Health
Write-Host "📡 Checking Backend API..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend API: Healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend API: Unhealthy (Status: $($backendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend API: Unreachable" -ForegroundColor Red
}

# Check Frontend
Write-Host "🌐 Checking Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: Unhealthy (Status: $($frontendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend: Unreachable" -ForegroundColor Red
}

# Check Langflow
Write-Host "🤖 Checking Langflow..." -ForegroundColor Yellow
try {
    $langflowResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -UseBasicParsing -TimeoutSec 5
    if ($langflowResponse.StatusCode -eq 200) {
        Write-Host "✅ Langflow: Healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Langflow: Unhealthy (Status: $($langflowResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Langflow: Unreachable" -ForegroundColor Red
}

# Check Database (PostgreSQL)
Write-Host "🗄️ Checking Database..." -ForegroundColor Yellow
try {
    $dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($dbTest.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL: Port accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: Port not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: Connection failed" -ForegroundColor Red
}

# Check Redis
Write-Host "📦 Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "✅ Redis: Port accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis: Port not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis: Connection failed" -ForegroundColor Red
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Health check completed!" -ForegroundColor Cyan
