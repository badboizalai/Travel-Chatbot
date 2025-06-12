# TravelMate Comprehensive Testing Framework

param(
    [ValidateSet("unit", "integration", "e2e", "all")]
    [string]$TestType = "all",
    
    [switch]$Watch,
    [switch]$Coverage,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 TravelMate Testing Framework" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        return $false
    }
    
    # Check Python
    try {
        $pythonVersion = python --version
        Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Python not found" -ForegroundColor Red
        return $false
    }
    
    # Check if services are running
    $services = @(
        @{ Name = "Frontend"; Port = 3000 },
        @{ Name = "Backend"; Port = 8000 },
        @{ Name = "Database"; Port = 5432 },
        @{ Name = "Redis"; Port = 6379 }
    )
    
    foreach ($service in $services) {
        try {
            $test = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue
            if ($test.TcpTestSucceeded) {
                Write-Host "✅ $($service.Name) (Port $($service.Port)): Running" -ForegroundColor Green
            } else {
                Write-Host "⚠️ $($service.Name) (Port $($service.Port)): Not running" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ $($service.Name): Connection failed" -ForegroundColor Red
        }
    }
    
    return $true
}

function Run-FrontendTests {
    Write-Host "🎨 Running Frontend Tests..." -ForegroundColor Magenta
    Write-Host "----------------------------" -ForegroundColor Magenta
    
    Set-Location "frontend"
    
    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
            npm install
        }
        
        # Build test arguments
        $testArgs = @("test")
        
        if (-not $Watch) {
            $testArgs += "--watchAll=false"
        }
        
        if ($Coverage) {
            $testArgs += "--coverage"
        }
        
        if ($Verbose) {
            $testArgs += "--verbose"
        }
        
        # Run tests
        Write-Host "🧪 Running React tests..." -ForegroundColor Blue
        & npm @testArgs
        
        # Run TypeScript compilation check
        Write-Host "🔍 Checking TypeScript compilation..." -ForegroundColor Blue
        & npx tsc --noEmit
        
        # Run linting
        Write-Host "📏 Running ESLint..." -ForegroundColor Blue
        if (Test-Path "node_modules\.bin\eslint.cmd") {
            & npx eslint src --ext .ts,.tsx
        } else {
            Write-Host "⚠️ ESLint not configured" -ForegroundColor Yellow
        }
        
        Write-Host "✅ Frontend tests completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Frontend tests failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Set-Location ".."
    }
    
    return $true
}

function Run-BackendTests {
    Write-Host "🔙 Running Backend Tests..." -ForegroundColor Magenta
    Write-Host "--------------------------" -ForegroundColor Magenta
    
    Set-Location "backend"
    
    try {
        # Activate virtual environment
        if (Test-Path "..\env\Scripts\Activate.ps1") {
            & "..\env\Scripts\Activate.ps1"
            Write-Host "✅ Activated virtual environment" -ForegroundColor Green
        }
        
        # Install test dependencies
        Write-Host "📦 Installing test dependencies..." -ForegroundColor Blue
        pip install pytest pytest-cov pytest-asyncio httpx
        
        # Create test directory if not exists
        if (-not (Test-Path "tests")) {
            New-Item -ItemType Directory -Path "tests" | Out-Null
            
            # Create sample test files
            $testInit = @"
# Test package initialization
"@
            $testInit | Out-File -FilePath "tests\__init__.py" -Encoding UTF8
            
            $testMain = @"
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "Travel Chatbot API" in response.json()["message"]

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_endpoints():
    # Test registration
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User"
    })
    assert response.status_code in [200, 400]  # 400 if user exists
    
    # Test login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com", 
        "password": "testpass123"
    })
    assert response.status_code in [200, 401]

def test_chatbot_endpoints():
    response = client.get("/api/chatbot/health")
    assert response.status_code == 200

def test_weather_endpoints():
    response = client.get("/api/weather/current?city=Ho Chi Minh City")
    assert response.status_code in [200, 503]  # 503 if API not configured
"@
            $testMain | Out-File -FilePath "tests\test_main.py" -Encoding UTF8
            
            Write-Host "✅ Created sample test files" -ForegroundColor Green
        }
        
        # Run tests
        $testArgs = @("tests")
        
        if ($Coverage) {
            $testArgs = @("--cov=.", "--cov-report=html", "--cov-report=term") + $testArgs
        }
        
        if ($Verbose) {
            $testArgs += "-v"
        }
        
        Write-Host "🧪 Running pytest..." -ForegroundColor Blue
        & pytest @testArgs
        
        # Run type checking with mypy if available
        Write-Host "🔍 Running type checking..." -ForegroundColor Blue
        try {
            pip install mypy
            & mypy . --ignore-missing-imports
        }
        catch {
            Write-Host "⚠️ MyPy not available, skipping type checking" -ForegroundColor Yellow
        }
        
        Write-Host "✅ Backend tests completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Backend tests failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Set-Location ".."
    }
    
    return $true
}

function Run-IntegrationTests {
    Write-Host "🔗 Running Integration Tests..." -ForegroundColor Magenta
    Write-Host "------------------------------" -ForegroundColor Magenta
    
    try {
        # API Integration Tests
        Write-Host "🌐 Testing API Integration..." -ForegroundColor Blue
        & .\scripts\test-api.ps1 -BaseUrl "http://localhost:8000"
        
        # Database Integration Tests
        Write-Host "🗄️ Testing Database Integration..." -ForegroundColor Blue
        Set-Location "backend"
        
        if (Test-Path "..\env\Scripts\Activate.ps1") {
            & "..\env\Scripts\Activate.ps1"
        }
        
        $dbTestScript = @"
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from config.database import engine
from models.models import User

# Test database connection
try:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Test query
    users = db.query(User).limit(5).all()
    print(f"✅ Database connection successful. Found {len(users)} users.")
    
    db.close()
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    sys.exit(1)
"@
        
        $dbTestScript | Out-File -FilePath "test_db_connection.py" -Encoding UTF8
        python test_db_connection.py
        Remove-Item "test_db_connection.py" -Force
        
        Set-Location ".."
        
        Write-Host "✅ Integration tests completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Integration tests failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Run-E2ETests {
    Write-Host "🎭 Running End-to-End Tests..." -ForegroundColor Magenta
    Write-Host "-----------------------------" -ForegroundColor Magenta
    
    Set-Location "frontend"
    
    try {
        # Install Playwright if not exists
        if (-not (Test-Path "node_modules\@playwright")) {
            Write-Host "📦 Installing Playwright..." -ForegroundColor Blue
            npm install --save-dev @playwright/test
            & npx playwright install
        }
        
        # Create E2E test directory if not exists
        if (-not (Test-Path "e2e")) {
            New-Item -ItemType Directory -Path "e2e" | Out-Null
            
            # Create sample E2E test
            $e2eTest = @"
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/TravelMate/);
});

test('chatbot widget appears', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible();
});

test('demo page functionality', async ({ page }) => {
  await page.goto('http://localhost:3000/demo');
  await expect(page.locator('h1')).toContainText('Demo');
});

test('navigation works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Weather');
  await expect(page).toHaveURL(/.*weather/);
});
"@
            $e2eTest | Out-File -FilePath "e2e\basic.spec.ts" -Encoding UTF8
            
            # Create Playwright config
            $playwrightConfig = @"
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
"@
            $playwrightConfig | Out-File -FilePath "playwright.config.ts" -Encoding UTF8
            
            Write-Host "✅ Created E2E test setup" -ForegroundColor Green
        }
        
        # Run E2E tests
        Write-Host "🎭 Running Playwright tests..." -ForegroundColor Blue
        & npx playwright test
        
        Write-Host "✅ E2E tests completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ E2E tests failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Set-Location ".."
    }
    
    return $true
}

# Main execution
if (-not (Test-Prerequisites)) {
    Write-Host "❌ Prerequisites check failed!" -ForegroundColor Red
    exit 1
}

$results = @{}

switch ($TestType) {
    "unit" {
        $results.Frontend = Run-FrontendTests
        $results.Backend = Run-BackendTests
    }
    "integration" {
        $results.Integration = Run-IntegrationTests
    }
    "e2e" {
        $results.E2E = Run-E2ETests
    }
    "all" {
        $results.Frontend = Run-FrontendTests
        $results.Backend = Run-BackendTests
        $results.Integration = Run-IntegrationTests
        $results.E2E = Run-E2ETests
    }
}

# Generate summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$allPassed = $true
foreach ($test in $results.GetEnumerator()) {
    $status = if ($test.Value) { "PASS" } else { "FAIL" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "$($test.Key): $status" -ForegroundColor $color
    
    if (-not $test.Value) {
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed!" -ForegroundColor Red
    exit 1
}
