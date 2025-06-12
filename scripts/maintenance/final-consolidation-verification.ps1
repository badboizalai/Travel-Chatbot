#!/usr/bin/env pwsh
# TravelMate Final Consolidation Verification Script

param(
    [switch]$Detailed,
    [switch]$GenerateReport
)

$ErrorActionPreference = "Continue"

Write-Host "🔍 TravelMate Final Consolidation Verification" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Verification Results
$verificationResults = @{
    "CriticalFiles" = @()
    "DocumentationConsolidation" = @()
    "PowerShellScripts" = @()
    "UserContextSystem" = @()
    "ProjectStructure" = @()
    "Issues" = @()
    "Warnings" = @()
}

# 1. Critical File Check
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

$criticalFilesOK = $true
foreach ($file in $criticalFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file - $($criticalFiles[$file])" -ForegroundColor Green
        $verificationResults.CriticalFiles += [PSCustomObject]@{
            File = $file
            Status = "✅"
            Description = $criticalFiles[$file]
        }
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
        $verificationResults.Issues += "Missing critical file: $file"
        $criticalFilesOK = $false
    }
}

# 2. Documentation Consolidation Check
Write-Host "`n📚 Checking Documentation Consolidation..." -ForegroundColor Yellow

$mdFiles = Get-ChildItem -Path "." -Recurse -Name "*.md" | Where-Object { $_ -notlike "*playwright-report*" -and $_ -notlike "*node_modules*" }
$mainReadmeExists = Test-Path "README.md"
$duplicateMdFiles = $mdFiles | Where-Object { $_ -ne "README.md" }

if ($mainReadmeExists) {
    Write-Host "  ✅ README.md exists as main documentation" -ForegroundColor Green
    $verificationResults.DocumentationConsolidation += [PSCustomObject]@{
        Item = "Main README.md"
        Status = "✅"
        Details = "Exists as primary documentation"
    }
} else {
    Write-Host "  ❌ README.md missing!" -ForegroundColor Red
    $verificationResults.Issues += "Main README.md file is missing"
}

if ($duplicateMdFiles.Count -eq 0) {
    Write-Host "  ✅ No duplicate MD files found - Consolidation complete" -ForegroundColor Green
    $verificationResults.DocumentationConsolidation += [PSCustomObject]@{
        Item = "MD File Consolidation"
        Status = "✅"
        Details = "All documentation consolidated into README.md"
    }
} else {
    Write-Host "  ⚠️  Found $($duplicateMdFiles.Count) remaining MD files:" -ForegroundColor Yellow
    foreach ($file in $duplicateMdFiles) {
        Write-Host "    - $file" -ForegroundColor Gray
        $verificationResults.Warnings += "Remaining MD file: $file"
    }
}

# 3. PowerShell Scripts Check
Write-Host "`n🔧 Checking PowerShell Scripts Organization..." -ForegroundColor Yellow

$scriptCategories = @{
    "scripts/core" = @("complete-setup.ps1", "start-dev.ps1", "build-prod.ps1", "sync-flow-id.ps1", "install-nodejs.ps1")
    "scripts/maintenance" = @("check-status.ps1", "health-check.ps1", "verify-system.ps1", "cleanup-dev.ps1")
    "scripts/testing" = @("run-tests.ps1", "test-api.ps1", "test-flow-id-sync.ps1")
}

foreach ($category in $scriptCategories.Keys) {
    if (Test-Path $category) {
        Write-Host "  ✅ $category directory exists" -ForegroundColor Green
        $scriptsFound = 0
        foreach ($script in $scriptCategories[$category]) {
            $scriptPath = Join-Path $category $script
            if (Test-Path $scriptPath) {
                $scriptsFound++
            }
        }
        Write-Host "    - Found $scriptsFound/$($scriptCategories[$category].Count) scripts" -ForegroundColor Gray
        $verificationResults.PowerShellScripts += [PSCustomObject]@{
            Category = $category
            Status = "✅"
            ScriptsFound = $scriptsFound
            TotalScripts = $scriptCategories[$category].Count
        }
    } else {
        Write-Host "  ❌ $category directory missing!" -ForegroundColor Red
        $verificationResults.Issues += "Missing script category: $category"
    }
}

# Check main launcher
if (Test-Path "run.ps1") {
    Write-Host "  ✅ Main script launcher (run.ps1) exists" -ForegroundColor Green
    $verificationResults.PowerShellScripts += [PSCustomObject]@{
        Category = "Root"
        Status = "✅"
        ScriptsFound = 1
        TotalScripts = 1
    }
} else {
    Write-Host "  ❌ Main script launcher (run.ps1) missing!" -ForegroundColor Red
    $verificationResults.Issues += "Missing main script launcher: run.ps1"
}

# 4. User Context System Check
Write-Host "`n👤 Checking User Context System..." -ForegroundColor Yellow

$userContextFiles = @{
    "test-user-context.ps1" = "PowerShell testing script"
    "test-user-context.py" = "Python testing script"
    "backend/routes/chatbot.py" = "Backend API with user context"
    "frontend/src/components/ChatWidget.tsx" = "Frontend chat widget"
    "frontend/src/services/api.ts" = "API service layer"
}

foreach ($file in $userContextFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file - $($userContextFiles[$file])" -ForegroundColor Green
        $verificationResults.UserContextSystem += [PSCustomObject]@{
            File = $file
            Status = "✅"
            Description = $userContextFiles[$file]
        }
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
        $verificationResults.Issues += "Missing user context file: $file"
    }
}

# 5. Project Structure Check
Write-Host "`n📁 Checking Project Structure..." -ForegroundColor Yellow

$requiredDirs = @("backend", "frontend", "custom", "scripts")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "  ✅ $dir/ directory exists" -ForegroundColor Green
        $verificationResults.ProjectStructure += [PSCustomObject]@{
            Directory = $dir
            Status = "✅"
        }
    } else {
        Write-Host "  ❌ $dir/ directory missing!" -ForegroundColor Red
        $verificationResults.Issues += "Missing directory: $dir"
    }
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "📊 CONSOLIDATION VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

$totalIssues = $verificationResults.Issues.Count
$totalWarnings = $verificationResults.Warnings.Count

if ($totalIssues -eq 0 -and $totalWarnings -eq 0) {
    Write-Host "🎉 Perfect! All consolidation checks passed!" -ForegroundColor Green
    Write-Host "`n✅ Critical files intact" -ForegroundColor Green
    Write-Host "✅ Documentation fully consolidated" -ForegroundColor Green
    Write-Host "✅ PowerShell scripts organized" -ForegroundColor Green
    Write-Host "✅ User context system complete" -ForegroundColor Green
    Write-Host "✅ Project structure verified" -ForegroundColor Green
    
    Write-Host "`n🚀 Status: CONSOLIDATION COMPLETE - READY FOR DEVELOPMENT" -ForegroundColor Green
} elseif ($totalIssues -eq 0) {
    Write-Host "✅ Consolidation successful with minor notes!" -ForegroundColor Green
    Write-Host "`n⚠️  Warnings ($totalWarnings):" -ForegroundColor Yellow
    foreach ($warning in $verificationResults.Warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Issues found that need attention!" -ForegroundColor Red
    Write-Host "`n❌ Critical Issues ($totalIssues):" -ForegroundColor Red
    foreach ($issue in $verificationResults.Issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
    if ($totalWarnings -gt 0) {
        Write-Host "`n⚠️  Warnings ($totalWarnings):" -ForegroundColor Yellow
        foreach ($warning in $verificationResults.Warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
    }
}

# Generate Report
if ($GenerateReport) {
    Write-Host "`n📝 Generating consolidation report..." -ForegroundColor Yellow
    
    $reportPath = "CONSOLIDATION_VERIFICATION_REPORT.md"
    $reportContent = @"
# 🔍 TravelMate Consolidation Verification Report

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status**: $(if($totalIssues -eq 0) { "✅ PASSED" } else { "❌ ISSUES FOUND" })

## 📊 Summary

- **Critical Issues**: $totalIssues
- **Warnings**: $totalWarnings
- **Critical Files**: $($verificationResults.CriticalFiles.Count) checked
- **Documentation**: $(if($duplicateMdFiles.Count -eq 0) { "✅ Fully consolidated" } else { "⚠️ $($duplicateMdFiles.Count) files remaining" })

## 📋 Detailed Results

### Critical Files
$($verificationResults.CriticalFiles | ForEach-Object { "- $($_.Status) $($_.File) - $($_.Description)" } | Out-String)

### Documentation Consolidation
$($verificationResults.DocumentationConsolidation | ForEach-Object { "- $($_.Status) $($_.Item) - $($_.Details)" } | Out-String)

### PowerShell Scripts
$($verificationResults.PowerShellScripts | ForEach-Object { "- $($_.Status) $($_.Category) - $($_.ScriptsFound)/$($_.TotalScripts) scripts" } | Out-String)

### User Context System  
$($verificationResults.UserContextSystem | ForEach-Object { "- $($_.Status) $($_.File) - $($_.Description)" } | Out-String)

$(if($totalIssues -gt 0) {
"## ❌ Issues to Resolve
$($verificationResults.Issues | ForEach-Object { "- $_" } | Out-String)"
})

$(if($totalWarnings -gt 0) {
"## ⚠️ Warnings
$($verificationResults.Warnings | ForEach-Object { "- $_" } | Out-String)"
})

---

**Generated by**: TravelMate Consolidation Verification Script
"@

    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "✅ Report generated: $reportPath" -ForegroundColor Green
}

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. .\run.ps1 setup    - Complete project setup" -ForegroundColor Blue
Write-Host "  2. .\run.ps1 start    - Start development" -ForegroundColor Blue
Write-Host "  3. .\test-user-context.ps1 - Test user context" -ForegroundColor Blue
Write-Host "  4. .\run.ps1 health   - Verify system health" -ForegroundColor Blue

Write-Host "`n✨ Consolidation verification completed!" -ForegroundColor Cyan
