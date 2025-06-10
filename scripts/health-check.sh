#!/bin/bash
# TravelMate Health Check Script

echo "🏥 TravelMate System Health Check"
echo "================================="

# Check Backend Health
echo "📡 Checking Backend API..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API: Healthy"
else
    echo "❌ Backend API: Unhealthy (Status: $BACKEND_STATUS)"
fi

# Check Frontend
echo "🌐 Checking Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy (Status: $FRONTEND_STATUS)"
fi

# Check Langflow
echo "🤖 Checking Langflow..."
LANGFLOW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/health)
if [ "$LANGFLOW_STATUS" = "200" ]; then
    echo "✅ Langflow: Healthy"
else
    echo "❌ Langflow: Unhealthy (Status: $LANGFLOW_STATUS)"
fi

# Check Database
echo "🗄️ Checking Database..."
if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Unhealthy"
fi

# Check Redis
echo "📦 Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

echo "================================="
echo "Health check completed!"
