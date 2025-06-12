#!/usr/bin/env python3
# Test script to verify route loading
import sys
import os
sys.path.append('/app')

print("Testing chatbot router imports...")

try:
    from fastapi import APIRouter
    print("✅ FastAPI imports successful")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")
    sys.exit(1)

try:
    from routes.chatbot import router
    print("✅ Chatbot router imported successfully")
    print(f"Router has {len(router.routes)} routes:")
    for route in router.routes:
        print(f"  {route.methods} {route.path}")
except Exception as e:
    print(f"❌ Chatbot router import failed: {e}")
    sys.exit(1)

print("✅ All tests passed!")
