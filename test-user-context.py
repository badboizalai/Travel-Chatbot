#!/usr/bin/env python3
"""
Test script để kiểm tra user context trong chatbot
"""

import requests
import json

# Configuration
BACKEND_URL = "http://localhost:8000"

def test_chat_with_user_context():
    """Test gửi tin nhắn với user context"""
    
    # Test data
    user_context = {
        "userId": 123,
        "email": "test@example.com", 
        "username": "testuser",
        "fullName": "Nguyen Van Test",
        "isAuthenticated": True
    }
    
    message_data = {
        "message": "Xin chào! Tôi muốn biết về tour du lịch Đà Lạt.",
        "user_context": user_context
    }
    
    try:
        print("🧪 Testing chatbot with user context...")
        print(f"📧 User: {user_context['fullName']} ({user_context['email']})")
        print(f"💬 Message: {message_data['message']}")
        print()
        
        # Send POST request to chat endpoint
        response = requests.post(
            f"{BACKEND_URL}/api/chatbot/chat",
            json=message_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"🤖 Bot Response: {result['response']}")
            print(f"🔑 Session ID: {result['session_id']}")
            
            # Check if bot response includes user info
            if user_context['email'] in result['response'] or user_context['fullName'] in result['response']:
                print("✅ Bot correctly recognized user information!")
            else:
                print("⚠️ Bot may not have processed user context correctly")
                
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend. Make sure the server is running on localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timeout. The server may be overloaded.")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_chat_without_user_context():
    """Test gửi tin nhắn không có user context (anonymous)"""
    
    message_data = {
        "message": "Xin chào! Tôi muốn biết về tour du lịch Hội An."
    }
    
    try:
        print("\n🧪 Testing chatbot without user context (anonymous)...")
        print(f"💬 Message: {message_data['message']}")
        print()
        
        response = requests.post(
            f"{BACKEND_URL}/api/chatbot/chat",
            json=message_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"🤖 Bot Response: {result['response']}")
            print(f"🔑 Session ID: {result['session_id']}")
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_flow_id_endpoint():
    """Test flow ID endpoint"""
    try:
        print("\n🧪 Testing flow ID endpoint...")
        
        response = requests.get(f"{BACKEND_URL}/api/chatbot/flow-id")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Flow ID endpoint working!")
            print(f"🔑 Flow ID: {result.get('flow_id')}")
            print(f"📊 Status: {result.get('status')}")
        else:
            print(f"❌ Flow ID endpoint failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("🚀 TravelMate Chatbot User Context Test")
    print("=" * 50)
    
    # Test flow ID first
    test_flow_id_endpoint()
    
    # Test with user context
    test_chat_with_user_context()
    
    # Test without user context
    test_chat_without_user_context()
    
    print("\n🎯 Test completed!")
    print("\nTo run this test:")
    print("1. Make sure backend is running: .\run.ps1 start")
    print("2. Run: python test-user-context.py")
