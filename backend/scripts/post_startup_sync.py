#!/usr/bin/env python3
"""
Post-Startup Flow ID Sync - Runs after all services are ready
"""
import requests
import os
import time
import json
import re

LANGFLOW_HOST = os.getenv("LANGFLOW_HOST", "http://langflow:8080")
BACKEND_HOST = os.getenv("BACKEND_HOST", "http://travel_backend:8000")

def log(message, level="INFO"):
    """Enhanced logging"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    prefix = {
        "INFO": "ℹ️",
        "SUCCESS": "✅",
        "WARNING": "⚠️",
        "ERROR": "❌",
        "SYNC": "🔄"
    }.get(level, "📝")
    
    print(f"[{timestamp}] {prefix} {message}")

def wait_for_services():
    """Wait for all services to be ready"""
    services = [
        ("Langflow", f"{LANGFLOW_HOST}/api/v1/health"),
        ("Backend", f"{BACKEND_HOST}/health")
    ]
    
    log("Waiting for all services to be ready...")
    
    all_ready = False
    max_attempts = 60
    attempt = 0
    
    while not all_ready and attempt < max_attempts:
        ready_count = 0
        
        for service_name, health_url in services:
            try:
                response = requests.get(health_url, timeout=5)
                if response.status_code == 200:
                    ready_count += 1
                else:
                    log(f"{service_name} not ready (HTTP {response.status_code})", "WARNING")
            except Exception as e:
                log(f"{service_name} not ready: {e}", "WARNING")
        
        if ready_count == len(services):
            all_ready = True
            log("All services are ready!", "SUCCESS")
        else:
            attempt += 1
            log(f"Waiting for services... ({ready_count}/{len(services)} ready, attempt {attempt}/{max_attempts})")
            time.sleep(2)
    
    if not all_ready:
        raise Exception("Services did not become ready within timeout")

def get_current_flow_id():
    """Get current Flow ID from Langflow"""
    try:
        log("Getting current Flow ID from Langflow...")
        
        response = requests.get(f"{LANGFLOW_HOST}/api/v1/flows/", timeout=10)
        response.raise_for_status()
        flows = response.json()
        
        # Look for Travel Chatbot flow first
        for flow in flows:
            if flow.get('name') == 'Travel Chatbot':
                flow_id = flow['id']
                log(f"Found Travel Chatbot flow: {flow_id}", "SUCCESS")
                return flow_id
        
        # Check persistent file from uploader
        try:
            with open("/app/data/flow_id.txt", 'r') as f:
                stored_flow_id = f.read().strip()
                if stored_flow_id:
                    log(f"Using stored Flow ID from uploader: {stored_flow_id}", "SUCCESS")
                    return stored_flow_id
        except:
            pass
        
        # Use first available flow as fallback
        if flows and len(flows) > 0:
            flow_id = flows[0]['id']
            log(f"Using first available flow: {flow_id} (Name: {flows[0].get('name', 'Unknown')})", "WARNING")
            return flow_id
            
        raise Exception("No flows found")
        
    except Exception as e:
        log(f"Failed to get Flow ID: {e}", "ERROR")
        return None

def update_backend_via_api(flow_id):
    """Update backend Flow ID via API call"""
    try:
        log("Notifying backend of Flow ID via API...")
        
        # Try to call backend's flow ID update endpoint
        response = requests.post(
            f"{BACKEND_HOST}/api/admin/update-flow-id",
            json={"flow_id": flow_id},
            timeout=10
        )
        
        if response.status_code == 200:
            log("Backend Flow ID updated successfully via API", "SUCCESS")
            return True
        else:
            log(f"Backend API update failed: HTTP {response.status_code}", "WARNING")
            return False
            
    except Exception as e:
        log(f"Failed to update backend via API: {e}", "WARNING")
        return False

def notify_frontend_via_backend(flow_id):
    """Notify frontend of Flow ID change via backend broadcast"""
    try:
        log("Broadcasting Flow ID change to frontend...")
        
        response = requests.post(
            f"{BACKEND_HOST}/api/admin/broadcast-flow-id",
            json={"flow_id": flow_id},
            timeout=10
        )
        
        if response.status_code == 200:
            log("Frontend notified successfully via backend broadcast", "SUCCESS")
            return True
        else:
            log(f"Frontend broadcast failed: HTTP {response.status_code}", "WARNING")
            return False
            
    except Exception as e:
        log(f"Failed to notify frontend: {e}", "WARNING")
        return False

def verify_sync(flow_id):
    """Verify that the sync was successful"""
    try:
        log("Verifying Flow ID sync...")
        
        # Check backend API
        response = requests.get(f"{BACKEND_HOST}/api/chatbot/flow-id", timeout=10)
        if response.status_code == 200:
            backend_data = response.json()
            backend_flow_id = backend_data.get('flow_id')
            
            if backend_flow_id == flow_id:
                log("✅ Backend verification successful", "SUCCESS")
                return True
            else:
                log(f"⚠️ Backend has different Flow ID: {backend_flow_id} vs {flow_id}", "WARNING")
                return False
        else:
            log(f"❌ Backend verification failed: HTTP {response.status_code}", "ERROR")
            return False
            
    except Exception as e:
        log(f"Verification failed: {e}", "ERROR")
        return False

def perform_post_startup_sync():
    """Perform post-startup Flow ID synchronization"""
    log("Starting Post-Startup Flow ID Sync...", "SYNC")
    
    try:
        # Wait for services
        wait_for_services()
        
        # Get current Flow ID
        current_flow_id = get_current_flow_id()
        if not current_flow_id:
            log("Cannot proceed without Flow ID", "ERROR")
            return False
        
        log(f"Current Flow ID: {current_flow_id}")
        
        # Update backend via API
        backend_updated = update_backend_via_api(current_flow_id)
        
        # Notify frontend via backend broadcast
        frontend_notified = notify_frontend_via_backend(current_flow_id)
        
        # Verify sync
        sync_verified = verify_sync(current_flow_id)
        
        # Summary
        log("=" * 50)
        if backend_updated and frontend_notified and sync_verified:
            log("Post-Startup Flow ID Sync completed successfully!", "SUCCESS")
            log(f"All services now use Flow ID: {current_flow_id}", "SUCCESS")
            return True
        else:
            log("Post-Startup Flow ID Sync completed with some warnings", "WARNING")
            log(f"Target Flow ID: {current_flow_id}", "INFO")
            log(f"Backend updated: {backend_updated}", "INFO")
            log(f"Frontend notified: {frontend_notified}", "INFO")
            log(f"Sync verified: {sync_verified}", "INFO")
            return False
        
    except Exception as e:
        log(f"Post-startup sync failed: {e}", "ERROR")
        return False
    finally:
        log("=" * 50)

def main():
    """Main execution"""
    try:
        # Add initial delay to ensure all services are fully started
        log("Waiting 10 seconds for services to fully initialize...")
        time.sleep(10)
        
        success = perform_post_startup_sync()
        
        if success:
            log("Post-startup sync completed successfully!", "SUCCESS")
        else:
            log("Post-startup sync completed with warnings", "WARNING")
        
        # Keep container running for a bit for debugging
        log("Sync completed. Container will exit in 5 seconds...")
        time.sleep(5)
        
    except Exception as e:
        log(f"Fatal error: {e}", "ERROR")
        exit(1)

if __name__ == "__main__":
    main()
