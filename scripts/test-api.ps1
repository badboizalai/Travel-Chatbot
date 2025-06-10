# TravelMate API Testing Script
# Run this to test all API endpoints

param(
    [string]$BaseUrl = "http://localhost:8000",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "🧪 TravelMate API Testing Suite" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "Testing Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Description,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Blue
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            if ($Verbose -and $response.Content) {
                $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($content) {
                    Write-Host "  📄 Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  ⚠️  WARN - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  ❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Health Check Tests
Write-Host "🏥 Health Check Tests" -ForegroundColor Magenta
Write-Host "--------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/health" -Description "Main Health Check"
Test-Endpoint -Url "$BaseUrl/" -Description "Root Endpoint"

# Authentication Tests
Write-Host "🔐 Authentication Tests" -ForegroundColor Magenta
Write-Host "----------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/auth/register" -Method "POST" -Description "User Registration" -Body @{
    email = "test@example.com"
    password = "testpassword123"
    name = "Test User"
}

Test-Endpoint -Url "$BaseUrl/api/auth/login" -Method "POST" -Description "User Login" -Body @{
    email = "test@example.com"
    password = "testpassword123"
}

# Chatbot Tests
Write-Host "🤖 Chatbot API Tests" -ForegroundColor Magenta
Write-Host "-------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/chatbot/health" -Description "Chatbot Health"
Test-Endpoint -Url "$BaseUrl/api/chatbot/chat" -Method "POST" -Description "Chat Message" -Body @{
    message = "Hello, I want to travel to Da Nang"
    user_id = "test-user"
}

# Weather Tests
Write-Host "🌤️ Weather API Tests" -ForegroundColor Magenta
Write-Host "--------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/weather/current?city=Ho Chi Minh City" -Description "Current Weather"
Test-Endpoint -Url "$BaseUrl/api/weather/forecast?city=Hanoi" -Description "Weather Forecast"

# Booking Tests
Write-Host "🏨 Booking API Tests" -ForegroundColor Magenta
Write-Host "-------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/booking/hotels?city=Da Nang" -Description "Hotel Search"
Test-Endpoint -Url "$BaseUrl/api/booking/flights?from=SGN&to=HAN" -Description "Flight Search"

# Search Tests
Write-Host "🔍 Search API Tests" -ForegroundColor Magenta
Write-Host "------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/search/destinations?query=beach" -Description "Destination Search"
Test-Endpoint -Url "$BaseUrl/api/search/attractions?city=Hoi An" -Description "Attraction Search"

# Admin Tests (will likely fail without auth)
Write-Host "👨‍💼 Admin API Tests" -ForegroundColor Magenta
Write-Host "-------------------" -ForegroundColor Magenta

Test-Endpoint -Url "$BaseUrl/api/admin/users" -Description "List Users (Auth Required)"
Test-Endpoint -Url "$BaseUrl/api/admin/analytics" -Description "Analytics (Auth Required)"

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "🎯 API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Use -Verbose flag for detailed responses" -ForegroundColor Gray
Write-Host "  - Ensure backend is running on $BaseUrl" -ForegroundColor Gray
Write-Host "  - Check individual endpoints if tests fail" -ForegroundColor Gray
