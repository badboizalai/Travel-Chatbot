# TravelMate AI Chatbot - Node.js Installation Script
# This script will download and install Node.js automatically

param(
    [switch]$SkipDownload,
    [switch]$LTS = $true
)

Write-Host "🚀 TravelMate AI Chatbot - Node.js Installer" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator for proper installation." -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Node.js is already installed
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is already installed: $nodeVersion" -ForegroundColor Green
        
        $npmVersion = npm --version 2>$null
        Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
        
        Write-Host "`n🎯 Node.js is ready! You can now run:" -ForegroundColor Green
        Write-Host "   .\setup-complete.ps1" -ForegroundColor Blue
        Write-Host "   or" -ForegroundColor Gray
        Write-Host "   .\start-dev.ps1" -ForegroundColor Blue
        exit 0
    }
} catch {
    # Node.js not found, continue with installation
}

Write-Host "📦 Node.js not found. Starting installation..." -ForegroundColor Yellow

# Determine Node.js version to download
if ($LTS) {
    $nodeVersion = "18.19.0"  # Current LTS
    Write-Host "📋 Installing Node.js LTS version: $nodeVersion" -ForegroundColor Green
} else {
    $nodeVersion = "20.10.0"  # Latest stable
    Write-Host "📋 Installing Node.js Latest version: $nodeVersion" -ForegroundColor Green
}

# Determine architecture
$arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
Write-Host "🏗️  Detected architecture: $arch" -ForegroundColor Blue

# Download URLs
$downloadUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-$arch.msi"
$installerPath = "$env:TEMP\nodejs-installer.msi"

if (-not $SkipDownload) {
    Write-Host "`n📥 Downloading Node.js installer..." -ForegroundColor Yellow
    Write-Host "   URL: $downloadUrl" -ForegroundColor Gray
    
    try {
        # Download with progress
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($downloadUrl, $installerPath)
        Write-Host "✅ Download completed!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Manual installation steps:" -ForegroundColor Yellow
        Write-Host "   1. Visit: https://nodejs.org/en/download/" -ForegroundColor Blue
        Write-Host "   2. Download the Windows Installer (.msi)" -ForegroundColor Blue
        Write-Host "   3. Run the installer with default settings" -ForegroundColor Blue
        Write-Host "   4. Restart PowerShell and run: .\setup-complete.ps1" -ForegroundColor Blue
        exit 1
    }
}

# Install Node.js
if (Test-Path $installerPath) {
    Write-Host "`n🔧 Installing Node.js..." -ForegroundColor Yellow
    Write-Host "   This may take a few minutes..." -ForegroundColor Gray
    
    try {
        # Run installer silently
        $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✅ Node.js installation completed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Installation completed with code: $($process.ExitCode)" -ForegroundColor Yellow
        }
        
        # Clean up installer
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Please try manual installation:" -ForegroundColor Yellow
        Write-Host "   Run the downloaded installer: $installerPath" -ForegroundColor Blue
        exit 1
    }
} else {
    Write-Host "❌ Installer not found at: $installerPath" -ForegroundColor Red
    exit 1
}

# Refresh environment variables
Write-Host "`n🔄 Refreshing environment..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Wait a moment for installation to complete
Start-Sleep -Seconds 3

# Verify installation
Write-Host "`n🔍 Verifying Node.js installation..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js installed successfully: $nodeVersion" -ForegroundColor Green
        
        $npmVersion = npm --version 2>$null
        Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
        
        Write-Host "`n🎉 Installation Complete!" -ForegroundColor Green
        Write-Host "=" * 30 -ForegroundColor Green
        
        Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Close and reopen PowerShell" -ForegroundColor Blue
        Write-Host "   2. Run: .\setup-complete.ps1" -ForegroundColor Blue
        Write-Host "   3. Or run: .\start-dev.ps1" -ForegroundColor Blue
        
        Write-Host "`n💡 Quick Start Commands:" -ForegroundColor Yellow
        Write-Host "   cd `"E:\Travel Chatbot`"" -ForegroundColor Gray
        Write-Host "   .\setup-complete.ps1" -ForegroundColor Gray
        
    } else {
        Write-Host "⚠️  Node.js may not be in PATH yet." -ForegroundColor Yellow
        Write-Host "   Please restart PowerShell and try again." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Unable to verify installation immediately." -ForegroundColor Yellow
    Write-Host "   Please restart PowerShell and run: node --version" -ForegroundColor Yellow
}

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   README.md - Project overview" -ForegroundColor Blue
Write-Host "   FINAL_SETUP_GUIDE.md - Complete setup guide" -ForegroundColor Blue
Write-Host "   docs/ - Detailed documentation" -ForegroundColor Blue

Write-Host "`n🌟 Welcome to TravelMate AI Chatbot Platform!" -ForegroundColor Green
