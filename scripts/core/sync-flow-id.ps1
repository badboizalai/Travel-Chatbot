#!/usr/bin/env pwsh
# Auto-sync Flow ID script - Automatically updates Flow ID in all files when Docker starts

Write-Host "🔄 Starting Flow ID Auto-Sync..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxRetries = 30,
        [int]$DelaySeconds = 2
    )
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $Url -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "🔄 Attempt $i/$MaxRetries - $ServiceName not ready yet..." -ForegroundColor Gray
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    
    Write-Host "❌ $ServiceName failed to become ready after $MaxRetries attempts" -ForegroundColor Red
    return $false
}

# Function to get Flow ID from Langflow
function Get-LangflowFlowId {
    try {
        $flows = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/flows/" -TimeoutSec 10
        
        # Look for Travel Chatbot flow first
        $travelFlow = $flows | Where-Object { $_.name -eq "Travel Chatbot" }
        if ($travelFlow) {
            Write-Host "✅ Found Travel Chatbot flow: $($travelFlow.id)" -ForegroundColor Green
            return $travelFlow.id
        }
        
        # If no Travel Chatbot flow, get the first available flow
        if ($flows -and $flows.Count -gt 0) {
            $firstFlow = $flows[0]
            Write-Host "⚠️ Using first available flow: $($firstFlow.id) (Name: $($firstFlow.name))" -ForegroundColor Yellow
            return $firstFlow.id
        }
        
        throw "No flows found in Langflow"
    } catch {
        Write-Host "❌ Failed to get Flow ID from Langflow: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to update Flow ID in backend .env file
function Update-BackendEnv {
    param([string]$FlowId)
    
    $envFile = "backend\.env"
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        
        # Update or add FLOW_ID
        if ($content -match "FLOW_ID=.*") {
            $newContent = $content -replace "FLOW_ID=.*", "FLOW_ID=$FlowId"
            Write-Host "🔄 Updated FLOW_ID in backend/.env" -ForegroundColor Cyan
        } else {
            $newContent = $content + "`nFLOW_ID=$FlowId"
            Write-Host "➕ Added FLOW_ID to backend/.env" -ForegroundColor Cyan
        }
        
        Set-Content -Path $envFile -Value $newContent -NoNewline
        Write-Host "✅ Backend .env updated with Flow ID: $FlowId" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Backend .env file not found, creating new one..." -ForegroundColor Yellow
        @"
FLOW_ID=$FlowId
LANGFLOW_HOST=http://langflow:8080
"@ | Set-Content -Path $envFile
        Write-Host "✅ Created backend/.env with Flow ID: $FlowId" -ForegroundColor Green
    }
}

# Function to update Flow ID in frontend langflowApi.ts
function Update-FrontendFlowId {
    param([string]$FlowId)
    
    $langflowApiFile = "frontend\src\services\langflowApi.ts"
    
    if (Test-Path $langflowApiFile) {
        $content = Get-Content $langflowApiFile -Raw
        
        # Update the hardcoded Flow ID
        if ($content -match "this\.flowId = '[^']+';") {
            $newContent = $content -replace "this\.flowId = '[^']+';", "this.flowId = '$FlowId';"
            Set-Content -Path $langflowApiFile -Value $newContent -NoNewline
            Write-Host "✅ Frontend langflowApi.ts updated with Flow ID: $FlowId" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Could not find Flow ID pattern in frontend file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Frontend langflowApi.ts not found" -ForegroundColor Red
    }
}

# Function to save Flow ID to persistent file
function Save-PersistentFlowId {
    param([string]$FlowId)
    
    $dataDir = "backend\data"
    if (!(Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }
    
    $flowIdFile = "$dataDir\flow_id.txt"
    Set-Content -Path $flowIdFile -Value $FlowId
    Write-Host "✅ Saved Flow ID to persistent file: $flowIdFile" -ForegroundColor Green
}

# Function to update Docker container's persistent file
function Update-DockerPersistentFile {
    param([string]$FlowId)
    
    try {
        # Write to Docker container's data volume
        $result = docker exec travel_backend sh -c "echo '$FlowId' > /app/data/flow_id.txt"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Updated Docker persistent file with Flow ID: $FlowId" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Could not update Docker persistent file" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Could not access Docker container: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "`n1️⃣ Waiting for services to be ready..." -ForegroundColor Blue

# Wait for Langflow to be ready
if (!(Wait-ForService -Url "http://localhost:8080/api/v1/version" -ServiceName "Langflow")) {
    Write-Host "❌ Cannot continue without Langflow" -ForegroundColor Red
    exit 1
}

# Wait for backend to be ready
if (!(Wait-ForService -Url "http://localhost:8000/health" -ServiceName "Backend")) {
    Write-Host "❌ Cannot continue without Backend" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Getting current Flow ID from Langflow..." -ForegroundColor Blue
$currentFlowId = Get-LangflowFlowId

if (!$currentFlowId) {
    Write-Host "❌ Could not get Flow ID from Langflow. Aborting sync." -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Updating all files with Flow ID: $currentFlowId" -ForegroundColor Blue

# Update backend .env
Update-BackendEnv -FlowId $currentFlowId

# Update frontend TypeScript file
Update-FrontendFlowId -FlowId $currentFlowId

# Save to persistent file
Save-PersistentFlowId -FlowId $currentFlowId

# Update Docker container's persistent file
Update-DockerPersistentFile -FlowId $currentFlowId

Write-Host "`n4️⃣ Restarting backend to pick up new Flow ID..." -ForegroundColor Blue
try {
    docker restart travel_backend | Out-Null
    Start-Sleep -Seconds 5
    Write-Host "✅ Backend restarted successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not restart backend: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Flow ID Auto-Sync Complete!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "Flow ID: $currentFlowId" -ForegroundColor White
Write-Host "✅ Backend .env updated" -ForegroundColor Green
Write-Host "✅ Frontend langflowApi.ts updated" -ForegroundColor Green
Write-Host "✅ Persistent files updated" -ForegroundColor Green
Write-Host "✅ Backend restarted" -ForegroundColor Green

# Verify the sync worked by testing the backend API
Write-Host "`n5️⃣ Verifying sync..." -ForegroundColor Blue
Start-Sleep -Seconds 3

try {
    $backendFlowId = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/flow-id" -TimeoutSec 10
    if ($backendFlowId.flow_id -eq $currentFlowId) {
        Write-Host "✅ Verification successful - Backend API returns correct Flow ID!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Verification warning - Backend API returns different Flow ID: $($backendFlowId.flow_id)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not verify backend API: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nFlow ID Auto-Sync is complete! All services should now use Flow ID: $currentFlowId" -ForegroundColor Cyan
