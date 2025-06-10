# TravelMate AI Chatbot - Complete Setup Script
# Run this in PowerShell as Administrator

param(
    [switch]$SkipDependencies,
    [switch]$Docker,
    [switch]$Production
)

$ErrorActionPreference = "Stop"

Write-Host "🌟 TravelMate AI Chatbot - Complete Setup" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

$prerequisites = @{
    "Node.js" = "node"
    "npm" = "npm"
    "Python" = "python"
    "pip" = "pip"
}

if ($Docker) {
    $prerequisites["Docker"] = "docker"
    $prerequisites["Docker Compose"] = "docker-compose"
}

foreach ($name in $prerequisites.Keys) {
    $command = $prerequisites[$name]
    if (Test-Command $command) {
        $version = & $command --version 2>$null | Select-Object -First 1
        Write-Host "✅ $name found: $version" -ForegroundColor Green
    } else {
        Write-Host "❌ $name not found. Please install $name first." -ForegroundColor Red
        switch ($name) {
            "Node.js" { Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow }
            "Python" { Write-Host "   Download from: https://python.org/" -ForegroundColor Yellow }
            "Docker" { Write-Host "   Download from: https://docker.com/" -ForegroundColor Yellow }
        }
        exit 1
    }
}

# Setup environment files
Write-Host "`n📝 Setting up environment files..." -ForegroundColor Yellow

# Frontend environment
$frontendEnv = @"
REACT_APP_API_URL=http://localhost:8000
REACT_APP_LANGFLOW_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
"@

if (-not (Test-Path "frontend\.env")) {
    $frontendEnv | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}

# Backend environment
$backendEnv = @"
DEBUG=True
DATABASE_URL=postgresql://postgres:password@localhost:5432/travel_db
REDIS_URL=redis://localhost:6379/0
LANGFLOW_HOST=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
"@

if (-not (Test-Path "backend\.env")) {
    $backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

if (-not $SkipDependencies) {
    # Install frontend dependencies
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location "frontend"
    try {
        npm install
        Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location

    # Install backend dependencies
    Write-Host "`n🐍 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location "backend"
    try {
        if (Test-Path "..\env\Scripts\activate.ps1") {
            Write-Host "📍 Activating virtual environment..." -ForegroundColor Blue
            & "..\env\Scripts\activate.ps1"
        }
        pip install -r requirements.txt
        Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Create necessary directories
Write-Host "`n📁 Creating necessary directories..." -ForegroundColor Yellow
$directories = @("backend\data", "backend\logs", "custom\flows", "frontend\build")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

if ($Docker) {
    Write-Host "`n🐳 Starting with Docker Compose..." -ForegroundColor Cyan
    try {
        docker-compose up --build -d
        Write-Host "✅ Docker services started!" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Blue
        Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Blue
        Write-Host "   Langflow: http://localhost:8080" -ForegroundColor Blue
        Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Blue
    } catch {
        Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n🚀 Setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Start the development servers:" -ForegroundColor White
    Write-Host "   ./start-dev.ps1" -ForegroundColor Cyan
    Write-Host "2. Or use Docker:" -ForegroundColor White
    Write-Host "   docker-compose up --build" -ForegroundColor Cyan
    Write-Host "3. Visit the application:" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Blue
    Write-Host "   Demo: http://localhost:3000/demo" -ForegroundColor Blue
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Blue
}

Write-Host "`n🎉 TravelMate AI Chatbot setup complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
