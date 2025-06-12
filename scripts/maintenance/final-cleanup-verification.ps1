#!/usr/bin/env pwsh
# Final cleanup verification script
# Verifies project structure and functionality after cleanup

Write-Host "🔍 TravelMate AI Chatbot - Final Cleanup Verification" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$ErrorCount = 0
$WarningCount = 0

function Test-RequiredFile {
    param([string]$FilePath, [string]$Description)
    
    if (Test-Path $FilePath) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description - Missing: $FilePath" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

function Test-OptionalFile {
    param([string]$FilePath, [string]$Description)
    
    if (Test-Path $FilePath) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  $Description - Not found: $FilePath" -ForegroundColor Yellow
        $script:WarningCount++
        return $false
    }
}

Write-Host "`n📋 Checking Core Files..." -ForegroundColor Yellow

# Core project files
Test-RequiredFile "README.md" "Main README documentation"
Test-RequiredFile "package.json" "Root package.json"
Test-RequiredFile "requirements.txt" "Root requirements.txt"
Test-RequiredFile "docker-compose.yml" "Docker Compose configuration"
Test-RequiredFile "Dockerfile" "Root Dockerfile"
Test-RequiredFile "run.ps1" "Main script launcher"

Write-Host "`n🐍 Checking Backend Structure..." -ForegroundColor Yellow

# Backend files
Test-RequiredFile "backend/main.py" "Backend main application"
Test-RequiredFile "backend/Dockerfile" "Backend Dockerfile"
Test-RequiredFile "backend/requirements.txt" "Backend requirements"

# Backend scripts
Test-RequiredFile "backend/scripts/manage_flow.py" "Flow management script"
Test-RequiredFile "backend/scripts/flow_sync_manager.py" "Flow sync manager"
Test-RequiredFile "backend/scripts/post_startup_sync.py" "Post startup sync"

Write-Host "`n⚛️  Checking Frontend Structure..." -ForegroundColor Yellow

# Frontend files
Test-RequiredFile "frontend/package.json" "Frontend package.json"
Test-RequiredFile "frontend/Dockerfile" "Frontend Dockerfile"
Test-RequiredFile "frontend/src/App.tsx" "Frontend main component"

Write-Host "`n🔧 Checking PowerShell Scripts Structure..." -ForegroundColor Yellow

# Core scripts
Test-RequiredFile "scripts/core/complete-setup.ps1" "Complete setup script"
Test-RequiredFile "scripts/core/start-dev.ps1" "Development start script"
Test-RequiredFile "scripts/core/build-prod.ps1" "Production build script"
Test-RequiredFile "scripts/core/sync-flow-id.ps1" "Flow ID sync script"

# Maintenance scripts
Test-RequiredFile "scripts/maintenance/check-status.ps1" "Status check script"
Test-RequiredFile "scripts/maintenance/health-check.ps1" "Health check script"
Test-RequiredFile "scripts/maintenance/cleanup-dev.ps1" "Development cleanup script"
Test-RequiredFile "scripts/maintenance/check-flow-id.ps1" "Flow ID check script"

# Testing scripts
Test-RequiredFile "scripts/testing/run-tests.ps1" "Test runner script"
Test-RequiredFile "scripts/testing/test-api.ps1" "API test script"
Test-RequiredFile "scripts/testing/test-flow-id-sync.ps1" "Flow ID sync test script"

Write-Host "`n🧹 Checking for Unwanted Files..." -ForegroundColor Yellow

# Check for files that should have been removed
$UnwantedPatterns = @(
    "__pycache__",
    "*.pyc",
    "flow-id-sync.log",
    "debug_*.py",
    "*.backup",
    "*.bak",
    "temp",
    "tmp"
)

$UnwantedFiles = @()
foreach ($pattern in $UnwantedPatterns) {
    $files = Get-ChildItem -Path "." -Recurse -Include $pattern -Force 2>$null
    if ($files) {
        $UnwantedFiles += $files
    }
}

if ($UnwantedFiles.Count -eq 0) {
    Write-Host "✅ No unwanted files found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $($UnwantedFiles.Count) unwanted files:" -ForegroundColor Yellow
    foreach ($file in $UnwantedFiles) {
        Write-Host "   - $($file.FullName)" -ForegroundColor Gray
    }
    $WarningCount++
}

Write-Host "`n🐳 Checking Docker Configuration..." -ForegroundColor Yellow

# Validate Docker Compose syntax
try {
    $dockerComposeCheck = docker-compose config --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Compose configuration is valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose configuration has errors:" -ForegroundColor Red
        Write-Host $dockerComposeCheck -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "⚠️  Could not validate Docker Compose (Docker not available)" -ForegroundColor Yellow
    $WarningCount++
}

Write-Host "`n📊 Verification Summary" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "🎉 Perfect! Project cleanup completed successfully!" -ForegroundColor Green
    Write-Host "   All required files are present and structure is clean." -ForegroundColor Green
} elseif ($ErrorCount -eq 0) {
    Write-Host "✅ Good! Project cleanup completed with minor warnings." -ForegroundColor Yellow
    Write-Host "   Errors: $ErrorCount | Warnings: $WarningCount" -ForegroundColor Yellow
} else {
    Write-Host "❌ Issues found during verification!" -ForegroundColor Red
    Write-Host "   Errors: $ErrorCount | Warnings: $WarningCount" -ForegroundColor Red
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test Docker containers: .\run.ps1 start" -ForegroundColor White
Write-Host "   2. Run system health check: .\run.ps1 health" -ForegroundColor White
Write-Host "   3. Test API endpoints: .\run.ps1 test" -ForegroundColor White

exit $ErrorCount
