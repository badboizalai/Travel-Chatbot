# Travel Chatbot - Quick Start Script
# Run this script in PowerShell as Administrator

Write-Host "🚀 Starting Travel Chatbot Platform..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
$frontendPath = "e:\Travel Chatbot\frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "📁 Changed to frontend directory" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies. Trying with --force..." -ForegroundColor Yellow
    try {
        npm install --force
        Write-Host "✅ Dependencies installed with --force!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies. Please check your internet connection." -ForegroundColor Red
        exit 1
    }
}

# Copy environment file if it doesn't exist
$envExample = ".env.example"
$envFile = ".env"
if (Test-Path $envExample) {
    if (-not (Test-Path $envFile)) {
        Copy-Item $envExample $envFile
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your API keys" -ForegroundColor Yellow
    } else {
        Write-Host "✅ .env file already exists" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env.example not found, skipping environment setup" -ForegroundColor Yellow
}

# Start the development server
Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "   Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "   Demo page: http://localhost:3000/demo" -ForegroundColor Green
Write-Host "`n   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Cyan

try {
    npm start
} catch {
    Write-Host "`n❌ Failed to start development server" -ForegroundColor Red
    Write-Host "   Please check the console output above for errors" -ForegroundColor Yellow
}

Write-Host "`n👋 Thanks for using Travel Chatbot Platform!" -ForegroundColor Cyan
