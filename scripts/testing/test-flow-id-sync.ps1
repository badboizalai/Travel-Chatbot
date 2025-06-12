#!/usr/bin/env pwsh
# Test script to verify Flow ID Auto-Sync

Write-Host "Testing Flow ID Auto-Sync System..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Check Backend API
Write-Host "`nTest 1: Backend API Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/flow-id" -Method GET -TimeoutSec 10
    
    if ($response.status -eq "success" -and $response.flow_id) {
        Write-Host "Backend API working - Flow ID: $($response.flow_id)" -ForegroundColor Green
        $backendFlowId = $response.flow_id
    } else {
        Write-Host "Backend API response invalid: $($response | ConvertTo-Json)" -ForegroundColor Yellow
        $backendFlowId = $null
    }
} catch {
    Write-Host "Backend API failed: $($_.Exception.Message)" -ForegroundColor Red
    $backendFlowId = $null
}

# Test 2: Check Flow ID in Frontend
Write-Host "`nTest 2: Frontend Flow ID" -ForegroundColor Yellow
$langflowApiFile = "frontend/src/services/langflowApi.ts"
if (Test-Path $langflowApiFile) {
    $content = Get-Content $langflowApiFile -Raw
    if ($content -match "this\.flowId = '([^']+)'") {
        $frontendFlowId = $matches[1]
        Write-Host "Frontend Flow ID found: $frontendFlowId" -ForegroundColor Green
    } else {
        Write-Host "Frontend Flow ID not found in expected format" -ForegroundColor Red
        $frontendFlowId = $null
    }
} else {
    Write-Host "Frontend langflowApi.ts not found" -ForegroundColor Red
    $frontendFlowId = $null
}

# Test 3: Check Persistent File
Write-Host "`nTest 3: Persistent Flow ID File" -ForegroundColor Yellow
try {
    $dockerFlowId = docker exec travel_backend cat /app/data/flow_id.txt 2>$null
    if ($dockerFlowId) {
        Write-Host "Docker persistent Flow ID: $($dockerFlowId.Trim())" -ForegroundColor Green
        $persistentFlowId = $dockerFlowId.Trim()
    } else {
        Write-Host "Docker persistent Flow ID not found" -ForegroundColor Yellow
        $persistentFlowId = $null
    }
} catch {
    Write-Host "Could not access Docker container" -ForegroundColor Red
    $persistentFlowId = $null
}

# Test 4: Check Langflow
Write-Host "`nTest 4: Langflow Connection" -ForegroundColor Yellow
try {
    $langflowResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/flows/" -Method GET -TimeoutSec 10
    if ($langflowResponse) {
        $travelChatbotFlow = $langflowResponse | Where-Object { $_.name -eq "Travel Chatbot" }
        if ($travelChatbotFlow) {
            Write-Host "Travel Chatbot flow found in Langflow: $($travelChatbotFlow.id)" -ForegroundColor Green
            $langflowFlowId = $travelChatbotFlow.id
        } else {
            Write-Host "Travel Chatbot flow not found in Langflow" -ForegroundColor Yellow
            $langflowFlowId = $null
        }
    }
} catch {
    Write-Host "Langflow connection failed: $($_.Exception.Message)" -ForegroundColor Red
    $langflowFlowId = $null
}

# Test 5: Sync Consistency Check
Write-Host "`nTest 5: Flow ID Consistency" -ForegroundColor Yellow
$allFlowIds = @($backendFlowId, $frontendFlowId, $persistentFlowId, $langflowFlowId) | Where-Object { $_ -ne $null }
$uniqueFlowIds = $allFlowIds | Sort-Object -Unique

if ($uniqueFlowIds.Count -eq 1) {
    Write-Host "All Flow IDs are consistent: $($uniqueFlowIds[0])" -ForegroundColor Green
    $syncStatus = "CONSISTENT"
} elseif ($uniqueFlowIds.Count -eq 0) {
    Write-Host "No Flow IDs found anywhere!" -ForegroundColor Red
    $syncStatus = "MISSING"
} else {
    Write-Host "Flow IDs are inconsistent:" -ForegroundColor Yellow
    foreach ($id in $uniqueFlowIds) {
        Write-Host "   - $id" -ForegroundColor White
    }
    $syncStatus = "INCONSISTENT"
}

# Test 6: Test chatbot endpoint
Write-Host "`nTest 6: Test Chatbot Functionality" -ForegroundColor Yellow
try {
    $chatResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/chat" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"message":"Hello, test message"}' -TimeoutSec 10
    if ($chatResponse) {
        Write-Host "Chatbot endpoint working" -ForegroundColor Green
    } else {
        Write-Host "Chatbot endpoint returned empty response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Chatbot endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`nTest Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Backend API:        $(if ($backendFlowId) { 'Working' } else { 'Failed' })" -ForegroundColor $(if ($backendFlowId) { 'Green' } else { 'Red' })
Write-Host "Frontend File:      $(if ($frontendFlowId) { 'Found' } else { 'Missing' })" -ForegroundColor $(if ($frontendFlowId) { 'Green' } else { 'Red' })
Write-Host "Persistent File:    $(if ($persistentFlowId) { 'Found' } else { 'Missing' })" -ForegroundColor $(if ($persistentFlowId) { 'Green' } else { 'Red' })
Write-Host "Langflow:           $(if ($langflowFlowId) { 'Connected' } else { 'Failed' })" -ForegroundColor $(if ($langflowFlowId) { 'Green' } else { 'Red' })
Write-Host "Sync Status:        $syncStatus" -ForegroundColor $(if ($syncStatus -eq 'CONSISTENT') { 'Green' } elseif ($syncStatus -eq 'INCONSISTENT') { 'Yellow' } else { 'Red' })

if ($syncStatus -eq "CONSISTENT" -and $backendFlowId) {
    Write-Host "`nFlow ID Auto-Sync System is working perfectly!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nFlow ID Auto-Sync System needs attention" -ForegroundColor Yellow
    exit 1
}
