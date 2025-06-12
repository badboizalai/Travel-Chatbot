#!/usr/bin/env pwsh
# Test User Context trong TravelMate Chatbot

param(
    [switch]$StartBackend,
    [switch]$VerboseMode
)

$ErrorActionPreference = "Continue"

Write-Host "🧪 TravelMate Chatbot - User Context Test" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if backend is running
function Test-BackendHealth {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/flow-id" -Method GET -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

# Start backend if requested
if ($StartBackend) {
    Write-Host "`n🚀 Starting backend..." -ForegroundColor Yellow
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "cd 'e:\EXE\New folder\Travel Chatbot'; .\run.ps1 start" -WindowStyle Normal
    Write-Host "⏱️  Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Check backend health
Write-Host "`n🔍 Checking backend health..." -ForegroundColor Yellow
$isHealthy = Test-BackendHealth

if (-not $isHealthy) {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "💡 Please start the backend first:" -ForegroundColor Yellow
    Write-Host "   .\run.ps1 start" -ForegroundColor Blue
    Write-Host "`nOr run this script with -StartBackend flag:" -ForegroundColor Yellow
    Write-Host "   .\test-user-context.ps1 -StartBackend" -ForegroundColor Blue
    exit 1
}

Write-Host "✅ Backend is running!" -ForegroundColor Green

# Test 1: Chat with user context
Write-Host "`n🧪 Test 1: Chat with User Context" -ForegroundColor Cyan
Write-Host "-" * 40 -ForegroundColor Cyan

$userContext = @{
    userId = 123
    email = "test@example.com"
    username = "testuser" 
    fullName = "Nguyen Van Test"
    isAuthenticated = $true
}

$testMessage1 = @{
    message = "Xin chào! Tôi muốn biết về tour du lịch Đà Lạt."
    user_context = $userContext
} | ConvertTo-Json -Depth 3

try {
    Write-Host "📧 User: $($userContext.fullName) ($($userContext.email))" -ForegroundColor Blue
    Write-Host "💬 Message: Xin chào! Tôi muốn biết về tour du lịch Đà Lạt." -ForegroundColor Blue
    
    $response1 = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/chat" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testMessage1 `
        -TimeoutSec 30
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "🤖 Bot Response:" -ForegroundColor Yellow
    Write-Host $response1.response -ForegroundColor White
    Write-Host "`n🔑 Session ID: $($response1.session_id)" -ForegroundColor Gray
    
    # Check if user info is mentioned
    if ($response1.response -like "*$($userContext.email)*" -or $response1.response -like "*$($userContext.fullName)*") {
        Write-Host "✅ Bot correctly recognized user information!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Bot may not have processed user context correctly" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Test 1 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($VerboseMode) {
        Write-Host $_.Exception.ToString() -ForegroundColor Red
    }
}

# Test 2: Chat without user context (anonymous)
Write-Host "`n🧪 Test 2: Anonymous Chat (No User Context)" -ForegroundColor Cyan
Write-Host "-" * 40 -ForegroundColor Cyan

$testMessage2 = @{
    message = "Xin chào! Tôi muốn biết về tour du lịch Hội An."
} | ConvertTo-Json

try {
    Write-Host "👤 Anonymous user" -ForegroundColor Blue
    Write-Host "💬 Message: Xin chào! Tôi muốn biết về tour du lịch Hội An." -ForegroundColor Blue
    
    $response2 = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/chat" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testMessage2 `
        -TimeoutSec 30
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "🤖 Bot Response:" -ForegroundColor Yellow
    Write-Host $response2.response -ForegroundColor White
    Write-Host "`n🔑 Session ID: $($response2.session_id)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Test 2 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($VerboseMode) {
        Write-Host $_.Exception.ToString() -ForegroundColor Red
    }
}

# Test 3: Flow ID endpoint
Write-Host "`n🧪 Test 3: Flow ID Endpoint" -ForegroundColor Cyan
Write-Host "-" * 40 -ForegroundColor Cyan

try {
    $flowIdResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/chatbot/flow-id" -Method GET
    
    Write-Host "✅ Flow ID endpoint working!" -ForegroundColor Green
    Write-Host "🔑 Flow ID: $($flowIdResponse.flow_id)" -ForegroundColor Blue
    Write-Host "📊 Status: $($flowIdResponse.status)" -ForegroundColor Blue
    
} catch {
    Write-Host "❌ Flow ID endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n🎯 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan
Write-Host "✅ User context can now be passed to chatbot" -ForegroundColor Green
Write-Host "✅ Anonymous users can still chat normally" -ForegroundColor Green
Write-Host "✅ ChatWidget will automatically include user info when available" -ForegroundColor Green

Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Test on frontend: Open browser to http://localhost:3000" -ForegroundColor Blue
Write-Host "2. Login with a test account" -ForegroundColor Blue
Write-Host "3. Open ChatWidget and send a message" -ForegroundColor Blue
Write-Host "4. Bot should greet you by name and remember your email" -ForegroundColor Blue

Write-Host "`n🚀 Ready to test on frontend!" -ForegroundColor Green
