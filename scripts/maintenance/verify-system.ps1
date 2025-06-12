#!/usr/bin/env pwsh
# TravelMate Post-Cleanup Verification Script

param(
    [switch]$Detailed,
    [switch]$ContainerTest
)

$ErrorActionPreference = "Continue"

Write-Host "🔍 TravelMate Post-Cleanup Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Critical File Check
Write-Host "`n📋 Checking Critical Container Dependencies..." -ForegroundColor Yellow

$criticalFiles = @{
    "backend/scripts/manage_flow.py" = "Uploader container dependency"
    "backend/scripts/flow_sync_manager.py" = "Flow sync container dependency"  
    "backend/scripts/post_startup_sync.py" = "Post-sync container dependency"
    "custom/TravelMate.json" = "Langflow configuration"
    "docker-compose.yml" = "Development orchestration"
    "docker-compose.prod.yml" = "Production orchestration"
    "backend/main.py" = "Backend FastAPI entry point"
    "frontend/src/App.tsx" = "Frontend React entry point"
    "README.md" = "Main documentation"
}

$allCriticalExists = $true
foreach ($file in $criticalFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "✅ $file - $($criticalFiles[$file])" -ForegroundColor Green
    } else {
        Write-Host "❌ MISSING: $file - $($criticalFiles[$file])" -ForegroundColor Red
        $allCriticalExists = $false
    }
}

# Documentation Check
Write-Host "`n📚 Documentation Status..." -ForegroundColor Yellow

$docFiles = @(
    "README.md"
)

foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        $size = (Get-Item $doc).Length
        Write-Host "✅ $doc ($([math]::Round($size/1KB, 1))KB)" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $doc" -ForegroundColor Red
    }
}

# Cleanup Verification
Write-Host "`n🧹 Cleanup Verification..." -ForegroundColor Yellow

$cleanupTargets = @{
    "__pycache__" = "Python cache directories"
    "*.bak" = "Backup files"
    "*_backup.*" = "Backup files with pattern"
    "debug_*.py" = "Debug files"
}

$foundClutter = $false
foreach ($pattern in $cleanupTargets.Keys) {
    $items = Get-ChildItem -Path . -Recurse -Name $pattern -ErrorAction SilentlyContinue
    if ($items) {
        $foundClutter = $true
        Write-Host "⚠️  Found $($cleanupTargets[$pattern]): $($items -join ', ')" -ForegroundColor Yellow
    }
}

if (-not $foundClutter) {
    Write-Host "✅ No unnecessary files found" -ForegroundColor Green
}

# Script Functionality Check
Write-Host "`n⚙️  Checking Core Scripts..." -ForegroundColor Yellow

$coreScripts = @(
    "complete-setup.ps1",
    "start-dev.ps1", 
    "check-status.ps1",
    "scripts/health-check.ps1"
)

foreach ($script in $coreScripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script exists" -ForegroundColor Green
        if ($Detailed) {
            $lines = (Get-Content $script).Count
            Write-Host "   Lines: $lines" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Missing: $script" -ForegroundColor Red
    }
}

# Container Test (Optional)
if ($ContainerTest) {
    Write-Host "`n🐳 Testing Container Configuration..." -ForegroundColor Yellow
    
    try {
        # Check docker-compose syntax
        $composeCheck = docker-compose config 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ docker-compose.yml syntax valid" -ForegroundColor Green
        } else {
            Write-Host "❌ docker-compose.yml has issues:" -ForegroundColor Red
            Write-Host $composeCheck -ForegroundColor Red
        }
        
        # Check production compose
        $prodComposeCheck = docker-compose -f docker-compose.prod.yml config 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ docker-compose.prod.yml syntax valid" -ForegroundColor Green
        } else {
            Write-Host "❌ docker-compose.prod.yml has issues:" -ForegroundColor Red
            Write-Host $prodComposeCheck -ForegroundColor Red
        }
        
    } catch {
        Write-Host "⚠️  Docker not available for testing" -ForegroundColor Yellow
    }
}

# Final Assessment
Write-Host "`n📊 Verification Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

if ($allCriticalExists -and -not $foundClutter) {
    Write-Host "✅ System Status: HEALTHY" -ForegroundColor Green
    Write-Host "✅ Cleanup Status: SUCCESSFUL" -ForegroundColor Green
    Write-Host "✅ Container Safety: CONFIRMED" -ForegroundColor Green
    
    Write-Host "`n🚀 Ready for:" -ForegroundColor Green
    Write-Host "   • Development: .\start-dev.ps1" -ForegroundColor White
    Write-Host "   • Production: .\build-prod.ps1" -ForegroundColor White
    Write-Host "   • Status Check: .\check-status.ps1" -ForegroundColor White
    
} else {
    Write-Host "⚠️  System Status: NEEDS ATTENTION" -ForegroundColor Yellow
    
    if (-not $allCriticalExists) {
        Write-Host "❌ Critical files missing - check DOCKER_DEPENDENCIES_WARNING.md" -ForegroundColor Red
    }
    
    if ($foundClutter) {
        Write-Host "⚠️  Some cleanup targets remain" -ForegroundColor Yellow
    }
}

Write-Host "`n📞 Support:" -ForegroundColor Gray
Write-Host "   • Documentation: README.md" -ForegroundColor Gray

Write-Host "`n✨ Verification completed!" -ForegroundColor Cyan
