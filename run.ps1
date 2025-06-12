#!/usr/bin/env pwsh
# TravelMate AI Chatbot - Script Launcher
# Quick access to all project scripts

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "start", "start-sync", "build", "status", "health", "test", "clean", "help")]
    [string]$Action = "help",
    
    [switch]$Docker,
    [switch]$Production,
    [switch]$VerboseMode
)

$ErrorActionPreference = "Stop"

# Define script paths
$ScriptPaths = @{
    "setup" = "scripts\core\complete-setup.ps1"
    "start" = "scripts\core\start-dev.ps1"
    "start-sync" = "scripts\core\sync-flow-id.ps1"
    "build" = "scripts\core\build-prod.ps1"
    "status" = "scripts\maintenance\check-status.ps1"
    "health" = "scripts\maintenance\health-check.ps1"
    "test" = "scripts\testing\run-tests.ps1"
    "clean" = "scripts\maintenance\cleanup-dev.ps1"
}

function Show-Help {
    Write-Host "🌟 TravelMate AI Chatbot - Script Launcher" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Available Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Core Operations:" -ForegroundColor Green
    Write-Host "  .\run.ps1 setup      - Complete project setup" -ForegroundColor White
    Write-Host "  .\run.ps1 start      - Start development environment" -ForegroundColor White  
    Write-Host "  .\run.ps1 start-sync - Start with Flow ID auto-sync" -ForegroundColor White
    Write-Host "  .\run.ps1 build      - Build for production" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Monitoring & Maintenance:" -ForegroundColor Green
    Write-Host "  .\run.ps1 status     - Check system status" -ForegroundColor White
    Write-Host "  .\run.ps1 health     - Run health checks" -ForegroundColor White
    Write-Host "  .\run.ps1 test       - Run test suite" -ForegroundColor White
    Write-Host "  .\run.ps1 clean      - Clean development environment" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Options:" -ForegroundColor Green
    Write-Host "  -Docker              - Use Docker mode" -ForegroundColor White
    Write-Host "  -Production          - Production mode" -ForegroundColor White
    Write-Host "  -VerboseMode         - Verbose output" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Examples:" -ForegroundColor Yellow
    Write-Host "  .\run.ps1 setup -Docker" -ForegroundColor Gray
    Write-Host "  .\run.ps1 start" -ForegroundColor Gray
    Write-Host "  .\run.ps1 build -Production" -ForegroundColor Gray
    Write-Host "  .\run.ps1 status -VerboseMode" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📞 For help: .\run.ps1 help" -ForegroundColor Cyan
}

function Invoke-Script {
    param($ScriptPath, $Arguments)
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "❌ Script not found: $ScriptPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🚀 Executing: $ScriptPath" -ForegroundColor Blue
    
    if ($Arguments) {
        & $ScriptPath @Arguments
    } else {
        & $ScriptPath
    }
}

# Main execution
switch ($Action) {
    "help" {
        Show-Help
        exit 0
    }
    
    default {
        if ($ScriptPaths.ContainsKey($Action)) {
            $scriptPath = $ScriptPaths[$Action]
            $arguments = @{}
            
            # Add common parameters
            if ($Docker) { $arguments.Docker = $true }
            if ($Production) { $arguments.Production = $true }
            if ($VerboseMode) { $arguments.Verbose = $true }
            
            Invoke-Script -ScriptPath $scriptPath -Arguments $arguments
        } else {
            Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
            Write-Host "💡 Use '.\run.ps1 help' to see available commands" -ForegroundColor Yellow
            exit 1
        }
    }
}
