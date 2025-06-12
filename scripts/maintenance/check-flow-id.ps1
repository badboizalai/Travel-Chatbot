#!/usr/bin/env pwsh
# Script để kiểm tra Flow ID hiện tại trong hệ thống

Write-Host "🔍 Đang kiểm tra Flow ID hiện tại..." -ForegroundColor Cyan

# Kiểm tra Flow ID từ backend
Write-Host "`n📡 Flow ID từ Backend API:" -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/flow-id" -Method GET
    Write-Host "   Flow ID: $($backendResponse.flow_id)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Không thể kết nối backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra Flow ID từ file persistent
Write-Host "`n📂 Flow ID từ file persistent:" -ForegroundColor Yellow
$flowIdFile = "data/flow_id.txt"
if (Test-Path $flowIdFile) {
    $storedFlowId = Get-Content $flowIdFile -Raw
    Write-Host "   Flow ID: $($storedFlowId.Trim())" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ File flow_id.txt không tồn tại" -ForegroundColor Yellow
}

# Kiểm tra Flow ID từ Docker volume
Write-Host "`n🐳 Flow ID từ Docker volume:" -ForegroundColor Yellow
try {
    $dockerFlowId = docker exec travel_backend cat /app/data/flow_id.txt 2>$null
    if ($dockerFlowId) {
        Write-Host "   Flow ID: $($dockerFlowId.Trim())" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Không tìm thấy flow ID trong Docker volume" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Không thể truy cập Docker container" -ForegroundColor Red
}

# Kiểm tra Langflow flows
Write-Host "`n🌊 Flows trong Langflow:" -ForegroundColor Yellow
try {
    $langflowFlows = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/flows/" -Method GET
    if ($langflowFlows.Count -gt 0) {
        foreach ($flow in $langflowFlows) {
            $status = if ($flow.name -eq "Travel Chatbot") { "✅" } else { "  " }
            Write-Host "   $status $($flow.name) - ID: $($flow.id)" -ForegroundColor White
        }
    } else {
        Write-Host "   ⚠️ Không có flows nào trong Langflow" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Không thể kết nối Langflow: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra Frontend langflowApi.ts
Write-Host "`n🎨 Flow ID trong Frontend:" -ForegroundColor Yellow
$langflowApiFile = "frontend/src/services/langflowApi.ts"
if (Test-Path $langflowApiFile) {
    $content = Get-Content $langflowApiFile -Raw
    if ($content -match "this\.flowId = '([^']+)'") {
        Write-Host "   Flow ID: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Không tìm thấy flow ID pattern" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ File langflowApi.ts không tồn tại" -ForegroundColor Red
}

Write-Host "`n✅ Kiểm tra hoàn tất!" -ForegroundColor Cyan
