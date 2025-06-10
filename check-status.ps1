# TravelMate AI Chatbot - Project Status Validator
# Validates the current setup and identifies what needs to be completed

Write-Host "🔍 TravelMate AI Chatbot - Project Status Check" -ForegroundColor Cyan
Write-Host "=" * 55 -ForegroundColor Cyan

$checks = @()
$warnings = @()
$errors = @()

# Function to add check result
function Add-Check($name, $status, $message, $action = "") {
    $script:checks += @{
        Name = $name
        Status = $status
        Message = $message
        Action = $action
    }
    
    $icon = if ($status -eq "✅") { "✅" } elseif ($status -eq "⚠️") { "⚠️" } else { "❌" }
    $color = if ($status -eq "✅") { "Green" } elseif ($status -eq "⚠️") { "Yellow" } else { "Red" }
    
    Write-Host "$icon $name`: $message" -ForegroundColor $color
    if ($action) {
        Write-Host "   → $action" -ForegroundColor Gray
    }
}

Write-Host "`n🏗️  CHECKING PROJECT STRUCTURE..." -ForegroundColor Yellow

# Check core directories
$coreDirectories = @("frontend", "backend", "docs", "scripts")
foreach ($dir in $coreDirectories) {
    if (Test-Path $dir) {
        Add-Check "Directory: $dir" "✅" "Found"
    } else {
        Add-Check "Directory: $dir" "❌" "Missing" "Check project structure"
    }
}

Write-Host "`n💻 CHECKING SYSTEM REQUIREMENTS..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Add-Check "Node.js" "✅" "Installed ($nodeVersion)"
        
        # Check npm
        try {
            $npmVersion = npm --version 2>$null
            Add-Check "npm" "✅" "Available ($npmVersion)"
        } catch {
            Add-Check "npm" "❌" "Not available" "Reinstall Node.js"
        }
    } else {
        Add-Check "Node.js" "❌" "Not installed" "Run: .\install-nodejs.ps1"
    }
} catch {
    Add-Check "Node.js" "❌" "Not installed" "Run: .\install-nodejs.ps1"
}

# Check Python
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Add-Check "Python" "✅" "Installed ($pythonVersion)"
    } else {
        Add-Check "Python" "❌" "Not found" "Install Python 3.8+"
    }
} catch {
    Add-Check "Python" "❌" "Not found" "Install Python 3.8+"
}

# Check Docker
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Add-Check "Docker" "✅" "Available ($($dockerVersion.Split(' ')[2]))"
    } else {
        Add-Check "Docker" "⚠️" "Not found" "Optional: Install Docker Desktop"
    }
} catch {
    Add-Check "Docker" "⚠️" "Not found" "Optional: Install Docker Desktop"
}

Write-Host "`n📦 CHECKING DEPENDENCIES..." -ForegroundColor Yellow

# Check frontend dependencies
if (Test-Path "frontend\node_modules") {
    Add-Check "Frontend Dependencies" "✅" "Installed"
} else {
    if (Test-Path "frontend\package.json") {
        Add-Check "Frontend Dependencies" "❌" "Not installed" "Run: cd frontend && npm install"
    } else {
        Add-Check "Frontend Dependencies" "❌" "package.json missing" "Check project structure"
    }
}

# Check backend dependencies
if (Test-Path "backend\requirements.txt") {
    if (Test-Path "env") {
        Add-Check "Backend Virtual Environment" "✅" "Found"
        Add-Check "Backend Dependencies" "⚠️" "Check manually" "Activate venv and check pip list"
    } else {
        Add-Check "Backend Dependencies" "❌" "Virtual environment missing" "Run: python -m venv env"
    }
} else {
    Add-Check "Backend Dependencies" "❌" "requirements.txt missing" "Check project structure"
}

Write-Host "`n🔧 CHECKING CONFIGURATION..." -ForegroundColor Yellow

# Check environment files
$envFiles = @(
    @{Path="frontend\.env"; Name="Frontend Environment"},
    @{Path="backend\.env"; Name="Backend Environment"}
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile.Path) {
        Add-Check $envFile.Name "✅" "Configured"
    } else {
        $examplePath = "$($envFile.Path).example"
        if (Test-Path $examplePath) {
            Add-Check $envFile.Name "⚠️" "Not configured" "Copy from $examplePath and edit"
        } else {
            Add-Check $envFile.Name "❌" "Missing" "Create environment file"
        }
    }
}

Write-Host "`n📋 CHECKING CORE FILES..." -ForegroundColor Yellow

# Check key files
$keyFiles = @(
    @{Path="README.md"; Name="Project README"},
    @{Path="package.json"; Name="Root Package.json"},
    @{Path="docker-compose.yml"; Name="Docker Compose"},
    @{Path="frontend\package.json"; Name="Frontend Package.json"},
    @{Path="backend\main.py"; Name="Backend Main"},
    @{Path="backend\requirements.txt"; Name="Backend Requirements"}
)

foreach ($file in $keyFiles) {
    if (Test-Path $file.Path) {
        Add-Check $file.Name "✅" "Found"
    } else {
        Add-Check $file.Name "❌" "Missing" "Check project integrity"
    }
}

# Summary
Write-Host "`n📊 STATUS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan

$successCount = ($checks | Where-Object { $_.Status -eq "✅" }).Count
$warningCount = ($checks | Where-Object { $_.Status -eq "⚠️" }).Count
$errorCount = ($checks | Where-Object { $_.Status -eq "❌" }).Count
$totalChecks = $checks.Count

Write-Host "Total Checks: $totalChecks" -ForegroundColor White
Write-Host "✅ Passed: $successCount" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warningCount" -ForegroundColor Yellow
Write-Host "❌ Errors: $errorCount" -ForegroundColor Red

$completionPercentage = [math]::Round(($successCount / $totalChecks) * 100, 1)
Write-Host "`nProject Completion: $completionPercentage%" -ForegroundColor Cyan

# Recommendations
Write-Host "`n🎯 NEXT STEPS RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan

if ($errorCount -eq 0 -and $warningCount -eq 0) {
    Write-Host "🎉 All checks passed! Your project is ready to run." -ForegroundColor Green
    Write-Host "`n🚀 Quick Start:" -ForegroundColor Yellow
    Write-Host "   .\start-dev.ps1" -ForegroundColor Blue
} elseif ($errorCount -eq 0) {
    Write-Host "✅ Core requirements met! Only minor issues to resolve." -ForegroundColor Green
    Write-Host "`n🔧 Recommended actions:" -ForegroundColor Yellow
    foreach ($check in $checks | Where-Object { $_.Status -eq "⚠️" -and $_.Action }) {
        Write-Host "   • $($check.Action)" -ForegroundColor Blue
    }
} else {
    Write-Host "⚠️  Some critical issues need to be resolved first." -ForegroundColor Yellow
    Write-Host "`n🔧 Required actions:" -ForegroundColor Red
    foreach ($check in $checks | Where-Object { $_.Status -eq "❌" -and $_.Action }) {
        Write-Host "   • $($check.Action)" -ForegroundColor Blue
    }
    
    Write-Host "`n📋 Priority order:" -ForegroundColor Yellow
    if (($checks | Where-Object { $_.Name -eq "Node.js" -and $_.Status -eq "❌" })) {
        Write-Host "   1. Install Node.js: .\install-nodejs.ps1" -ForegroundColor Blue
    }
    if (($checks | Where-Object { $_.Name -like "*Dependencies*" -and $_.Status -eq "❌" })) {
        Write-Host "   2. Install dependencies: .\setup-complete.ps1" -ForegroundColor Blue
    }
    if (($checks | Where-Object { $_.Name -like "*Environment*" -and $_.Status -ne "✅" })) {
        Write-Host "   3. Configure environment files" -ForegroundColor Blue
    }
}

Write-Host "`n📚 AVAILABLE SCRIPTS" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan
Write-Host "• .\install-nodejs.ps1     - Install Node.js automatically" -ForegroundColor Blue
Write-Host "• .\setup-complete.ps1     - Complete project setup" -ForegroundColor Blue
Write-Host "• .\start-dev.ps1          - Start development server" -ForegroundColor Blue
Write-Host "• .\build-prod.ps1         - Build for production" -ForegroundColor Blue
Write-Host "• .\scripts\health-check.ps1 - System health check" -ForegroundColor Blue

Write-Host "`n📖 DOCUMENTATION" -ForegroundColor Cyan
Write-Host "=" * 25 -ForegroundColor Cyan
Write-Host "• README.md                - Project overview" -ForegroundColor Blue
Write-Host "• FINAL_SETUP_GUIDE.md     - Complete setup guide" -ForegroundColor Blue
Write-Host "• docs\PROJECT_STRUCTURE.md - Architecture details" -ForegroundColor Blue
Write-Host "• docs\DEPLOYMENT_GUIDE.md  - Production deployment" -ForegroundColor Blue

Write-Host "`n✨ TravelMate AI Chatbot Platform Status Check Complete!" -ForegroundColor Green
