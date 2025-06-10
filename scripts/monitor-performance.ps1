# TravelMate Performance Monitoring Script

param(
    [int]$Duration = 60,  # seconds
    [int]$Interval = 5,   # seconds
    [string]$OutputFile = "",
    [switch]$Continuous
)

$ErrorActionPreference = "Continue"

Write-Host "📊 TravelMate Performance Monitor" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($OutputFile) {
    $logFile = $OutputFile
} else {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logFile = "performance_$timestamp.log"
}

Write-Host "📝 Logging to: $logFile" -ForegroundColor Yellow
Write-Host "⏱️ Duration: $Duration seconds" -ForegroundColor Yellow
Write-Host "🔄 Interval: $Interval seconds" -ForegroundColor Yellow
Write-Host ""

# Initialize log file
"TravelMate Performance Monitor - $(Get-Date)" | Out-File -FilePath $logFile
"=" * 50 | Out-File -FilePath $logFile -Append

function Get-SystemMetrics {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # CPU Usage
    $cpu = Get-WmiObject -Class Win32_Processor | Measure-Object -Property LoadPercentage -Average
    $cpuUsage = [math]::Round($cpu.Average, 2)
    
    # Memory Usage
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalRAM = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $freeRAM = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
    $memoryUsage = [math]::Round(($usedRAM / $totalRAM) * 100, 2)
    
    # Disk Usage
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $totalDisk = [math]::Round($disk.Size / 1GB, 2)
    $freeDisk = [math]::Round($disk.FreeSpace / 1GB, 2)
    $usedDisk = [math]::Round($totalDisk - $freeDisk, 2)
    $diskUsage = [math]::Round(($usedDisk / $totalDisk) * 100, 2)
    
    return @{
        Timestamp = $timestamp
        CPU = $cpuUsage
        Memory = @{
            Total = $totalRAM
            Used = $usedRAM
            Free = $freeRAM
            Percentage = $memoryUsage
        }
        Disk = @{
            Total = $totalDisk
            Used = $usedDisk
            Free = $freeDisk
            Percentage = $diskUsage
        }
    }
}

function Get-ServiceMetrics {
    $services = @{}
    
    # Check Frontend (Port 3000)
    try {
        $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
        $services.Frontend = @{
            Status = "Online"
            ResponseTime = $frontend.Headers.'Response-Time'
            StatusCode = $frontend.StatusCode
        }
    }
    catch {
        $services.Frontend = @{
            Status = "Offline"
            Error = $_.Exception.Message
        }
    }
    
    # Check Backend (Port 8000)
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $backend = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
        $stopwatch.Stop()
        
        $services.Backend = @{
            Status = "Online"
            ResponseTime = "$($stopwatch.ElapsedMilliseconds)ms"
            StatusCode = $backend.StatusCode
        }
    }
    catch {
        $services.Backend = @{
            Status = "Offline"
            Error = $_.Exception.Message
        }
    }
    
    # Check Langflow (Port 8080)
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $langflow = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -UseBasicParsing -TimeoutSec 3
        $stopwatch.Stop()
        
        $services.Langflow = @{
            Status = "Online"
            ResponseTime = "$($stopwatch.ElapsedMilliseconds)ms"
            StatusCode = $langflow.StatusCode
        }
    }
    catch {
        $services.Langflow = @{
            Status = "Offline"
            Error = $_.Exception.Message
        }
    }
    
    # Check Database (Port 5432)
    try {
        $dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
        $services.Database = @{
            Status = if ($dbTest.TcpTestSucceeded) { "Online" } else { "Offline" }
            Port = 5432
        }
    }
    catch {
        $services.Database = @{
            Status = "Offline"
            Error = $_.Exception.Message
        }
    }
    
    # Check Redis (Port 6379)
    try {
        $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
        $services.Redis = @{
            Status = if ($redisTest.TcpTestSucceeded) { "Online" } else { "Offline" }
            Port = 6379
        }
    }
    catch {
        $services.Redis = @{
            Status = "Offline"
            Error = $_.Exception.Message
        }
    }
    
    return $services
}

function Write-Metrics {
    param($SystemMetrics, $ServiceMetrics)
    
    $timestamp = $SystemMetrics.Timestamp
    
    # Display on console
    Write-Host "⏰ $timestamp" -ForegroundColor White
    Write-Host "💻 CPU: $($SystemMetrics.CPU)%" -ForegroundColor $(if($SystemMetrics.CPU -gt 80) { "Red" } elseif($SystemMetrics.CPU -gt 60) { "Yellow" } else { "Green" })
    Write-Host "🧠 Memory: $($SystemMetrics.Memory.Percentage)% ($($SystemMetrics.Memory.Used)GB / $($SystemMetrics.Memory.Total)GB)" -ForegroundColor $(if($SystemMetrics.Memory.Percentage -gt 80) { "Red" } elseif($SystemMetrics.Memory.Percentage -gt 60) { "Yellow" } else { "Green" })
    Write-Host "💾 Disk: $($SystemMetrics.Disk.Percentage)% ($($SystemMetrics.Disk.Used)GB / $($SystemMetrics.Disk.Total)GB)" -ForegroundColor $(if($SystemMetrics.Disk.Percentage -gt 80) { "Red" } elseif($SystemMetrics.Disk.Percentage -gt 60) { "Yellow" } else { "Green" })
    
    Write-Host "🌐 Services:" -ForegroundColor Cyan
    foreach ($service in $ServiceMetrics.GetEnumerator()) {
        $status = $service.Value.Status
        $color = if ($status -eq "Online") { "Green" } else { "Red" }
        $details = if ($service.Value.ResponseTime) { " ($($service.Value.ResponseTime))" } else { "" }
        Write-Host "  $($service.Key): $status$details" -ForegroundColor $color
    }
    Write-Host ""
    
    # Log to file
    $logEntry = @"
[$timestamp]
System Metrics:
  CPU: $($SystemMetrics.CPU)%
  Memory: $($SystemMetrics.Memory.Percentage)% ($($SystemMetrics.Memory.Used)GB / $($SystemMetrics.Memory.Total)GB)
  Disk: $($SystemMetrics.Disk.Percentage)% ($($SystemMetrics.Disk.Used)GB / $($SystemMetrics.Disk.Total)GB)

Service Status:
"@
    
    foreach ($service in $ServiceMetrics.GetEnumerator()) {
        $details = if ($service.Value.ResponseTime) { " - Response: $($service.Value.ResponseTime)" } else { "" }
        $error = if ($service.Value.Error) { " - Error: $($service.Value.Error)" } else { "" }
        $logEntry += "`n  $($service.Key): $($service.Value.Status)$details$error"
    }
    
    $logEntry += "`n" + "-" * 50
    $logEntry | Out-File -FilePath $logFile -Append
}

# Main monitoring loop
$startTime = Get-Date
$endTime = $startTime.AddSeconds($Duration)

do {
    $systemMetrics = Get-SystemMetrics
    $serviceMetrics = Get-ServiceMetrics
    
    Write-Metrics -SystemMetrics $systemMetrics -ServiceMetrics $serviceMetrics
    
    if (-not $Continuous -and (Get-Date) -lt $endTime) {
        Start-Sleep -Seconds $Interval
    } elseif ($Continuous) {
        Start-Sleep -Seconds $Interval
    }
    
} while ($Continuous -or (Get-Date) -lt $endTime)

Write-Host "📊 Monitoring completed!" -ForegroundColor Green
Write-Host "📄 Report saved to: $logFile" -ForegroundColor Yellow

# Generate summary
$summary = @"

Performance Summary:
===================
Monitor Duration: $Duration seconds
Log File: $logFile
Report Generated: $(Get-Date)

Recommendations:
- Monitor CPU usage regularly (keep below 80%)
- Ensure adequate memory (keep below 80%)
- Check disk space periodically
- Verify all services are online
- Review response times for optimization

"@

$summary | Out-File -FilePath $logFile -Append
Write-Host $summary -ForegroundColor Cyan
