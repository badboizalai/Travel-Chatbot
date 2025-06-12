# TravelMate AI Chatbot - Production Build Script
# Run this script in PowerShell

param(
    [switch]$Docker,
    [switch]$Deploy,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🏗️  Building TravelMate AI Chatbot for Production..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Navigate to project root
$projectRoot = "e:\Travel Chatbot"
if (Test-Path $projectRoot) {
    Set-Location $projectRoot
    Write-Host "📁 Working in project directory" -ForegroundColor Green
} else {
    Write-Host "❌ Project directory not found: $projectRoot" -ForegroundColor Red
    exit 1
}

# Set production environment variables
Write-Host "`n🔧 Setting up production environment..." -ForegroundColor Yellow

# Frontend production environment
$frontendProdEnv = @"
REACT_APP_API_URL=https://api.travelmate.com
REACT_APP_LANGFLOW_URL=https://langflow.travelmate.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
"@

$frontendProdEnv | Out-File -FilePath "frontend\.env.production" -Encoding UTF8
Write-Host "✅ Created frontend/.env.production" -ForegroundColor Green

# Backend production environment
$backendProdEnv = @"
DEBUG=False
DATABASE_URL=postgresql://user:password@prod-db:5432/travel_db
REDIS_URL=redis://prod-redis:6379/0
LANGFLOW_HOST=https://langflow.travelmate.com
JWT_SECRET=super-secure-jwt-secret-key-for-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=["https://travelmate.com","https://www.travelmate.com"]
"@

$backendProdEnv | Out-File -FilePath "backend\.env.production" -Encoding UTF8
Write-Host "✅ Created backend/.env.production" -ForegroundColor Green

if ($Docker) {
    Write-Host "`n🐳 Building Docker images..." -ForegroundColor Cyan
    
    # Build frontend Docker image
    Write-Host "📦 Building frontend image..." -ForegroundColor Yellow
    docker build -t travelmate-frontend:latest ./frontend
    
    # Build backend Docker image
    Write-Host "🐍 Building backend image..." -ForegroundColor Yellow
    docker build -t travelmate-backend:latest ./backend
    
    Write-Host "✅ Docker images built successfully!" -ForegroundColor Green
    
    if ($Deploy) {
        Write-Host "`n🚀 Deploying with Docker Compose..." -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml up -d
        Write-Host "✅ Production deployment started!" -ForegroundColor Green
    }
} else {
    # Build frontend
    Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
    Push-Location "frontend"
    
    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
            npm ci --only=production
        }
        
        # Build for production
        npm run build
        Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
        
        # Optimize build
        Write-Host "🔧 Optimizing build..." -ForegroundColor Blue
        $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "📊 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Blue
        
    } catch {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    
    # Prepare backend
    Write-Host "`n🐍 Preparing backend..." -ForegroundColor Yellow
    Push-Location "backend"
    
    try {
        # Install production dependencies
        if (Test-Path "..\env\Scripts\activate.ps1") {
            & "..\env\Scripts\activate.ps1"
        }
        pip install -r requirements.txt --no-dev
        Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Backend preparation failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "travelmate-$Environment-$timestamp.zip"

$filesToInclude = @(
    "frontend/build/*",
    "backend/*",
    "custom/*",
    "docker-compose.prod.yml",
    "README.md",
    "requirements.txt"
)

try {
    Compress-Archive -Path $filesToInclude -DestinationPath $packageName -Force
    Write-Host "✅ Deployment package created: $packageName" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not create deployment package" -ForegroundColor Yellow
}

Write-Host "`n🎉 Production build completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the build folder to your web server" -ForegroundColor White
Write-Host "2. Configure your reverse proxy (Nginx/Apache)" -ForegroundColor White
Write-Host "3. Set up SSL certificates" -ForegroundColor White
Write-Host "4. Configure monitoring and logging" -ForegroundColor White

if ($Docker) {
    Write-Host "`nDocker commands:" -ForegroundColor Yellow
    Write-Host "• View logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "• Stop services: docker-compose down" -ForegroundColor White
    Write-Host "• Restart: docker-compose restart" -ForegroundColor White
}

Write-Host "`n🌟 TravelMate AI Chatbot ready for production!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
}

# Build the project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    
    # Show build info
    $buildPath = "build"
    if (Test-Path $buildPath) {
        $buildSize = (Get-ChildItem $buildPath -Recurse | Measure-Object -Property Length -Sum).Sum
        $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
        Write-Host "📊 Build size: $buildSizeMB MB" -ForegroundColor Green
        Write-Host "📁 Build files location: $frontendPath\build" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 Production build ready!" -ForegroundColor Cyan
    Write-Host "   You can now deploy the 'build' folder to your web server" -ForegroundColor Green
    Write-Host "   Or serve locally with: npx serve -s build" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Travel Chatbot production build completed!" -ForegroundColor Cyan
