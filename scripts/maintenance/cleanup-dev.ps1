#!/usr/bin/env pwsh
# Script để dọn dẹp background jobs và tài nguyên

Write-Host "🧹 Cleaning up TravelMate development environment..." -ForegroundColor Cyan

# Stop all background jobs related to flow sync
Write-Host "`n🛑 Stopping background jobs..." -ForegroundColor Yellow
$jobs = Get-Job | Where-Object { $_.Command -like "*sync-flow-id*" }
if ($jobs) {
    foreach ($job in $jobs) {
        Write-Host "   Stopping job: $($job.Name) (ID: $($job.Id))" -ForegroundColor Gray
        Stop-Job -Job $job
        Remove-Job -Job $job
    }
    Write-Host "✅ Stopped $($jobs.Count) background job(s)" -ForegroundColor Green
} else {
    Write-Host "   No background jobs found" -ForegroundColor Gray
}

# Stop Docker containers if running
Write-Host "`n🐳 Checking Docker containers..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}" | Where-Object { $_ -match "travel_|langflow|uploader" }
    if ($containers) {
        Write-Host "   Stopping TravelMate containers..." -ForegroundColor Gray
        docker-compose down
        Write-Host "✅ Docker containers stopped" -ForegroundColor Green
    } else {
        Write-Host "   No TravelMate containers running" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Docker not available or not running" -ForegroundColor Gray
}

# Kill any remaining Node.js processes on port 3000
Write-Host "`n🔌 Checking for processes on port 3000..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            $process = Get-Process -Id $proc.OwningProcess -ErrorAction SilentlyContinue
            if ($process -and $process.ProcessName -eq "node") {
                Write-Host "   Stopping Node.js process: $($process.Id)" -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force
            }
        }
        Write-Host "✅ Stopped processes on port 3000" -ForegroundColor Green
    } else {
        Write-Host "   No processes found on port 3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Could not check port 3000" -ForegroundColor Gray
}

# Clean up temporary files
Write-Host "`n🗑️  Cleaning temporary files..." -ForegroundColor Yellow
$tempFiles = @(
    "flow-id-sync.log",
    "frontend/npm-debug.log",
    "frontend/.npm-debug.log",
    "backend/__pycache__",
    "data/flow_id_changed.json"
)

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Cleanup completed!" -ForegroundColor Green

# Show summary
Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Background jobs stopped" -ForegroundColor Green
Write-Host "   ✅ Docker containers stopped (if running)" -ForegroundColor Green
Write-Host "   ✅ Port 3000 processes stopped" -ForegroundColor Green
Write-Host "   ✅ Temporary files cleaned" -ForegroundColor Green

Write-Host "`n🎉 Environment cleaned successfully!" -ForegroundColor Cyan
Write-Host "   You can now restart with: .\start-dev.ps1" -ForegroundColor Yellow
