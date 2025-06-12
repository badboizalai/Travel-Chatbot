#!/usr/bin/env python3
"""
Flow ID Auto-Sync Manager - Automatically sync Flow ID across all services
"""
import requests
import os
import time
import json
import subprocess
import sys

LANGFLOW_HOST = os.getenv("LANGFLOW_HOST", "http://langflow:8080")
BACKEND_HOST = os.getenv("BACKEND_HOST", "http://travel_backend:8000")
FLOW_ID_FILE = "/app/data/flow_id.txt"
SYNC_STATUS_FILE = "/app/data/sync_status.json"

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

def ensure_data_dir():
    """Ensure data directory exists"""
    os.makedirs("/app/data", exist_ok=True)

def get_current_flow_id():
    """Get current Flow ID - Priority: 1) From uploader persistent file, 2) From Langflow API"""
    try:
        # Priority 1: Get from uploader's persistent file
        stored_flow_id = get_stored_flow_id()
        if stored_flow_id:
            log(f"Using stored Flow ID from uploader: {stored_flow_id}", "SUCCESS")
            return stored_flow_id
        
        log("No stored Flow ID found, querying Langflow API...")
        
        # Priority 2: Get from Langflow API
        response = requests.get(f"{LANGFLOW_HOST}/api/v1/flows/", timeout=10)
        response.raise_for_status()
        flows = response.json()
        
        # Look for Travel Chatbot flow first
        for flow in flows:
            if flow.get('name') == 'Travel Chatbot':
                flow_id = flow['id']
                log(f"Found Travel Chatbot flow in Langflow: {flow_id}", "SUCCESS")
                return flow_id
        
        # If no Travel Chatbot flow, use first available
        if flows and len(flows) > 0:
            flow_id = flows[0]['id']
            log(f"Using first available flow: {flow_id} (Name: {flows[0].get('name', 'Unknown')})", "WARNING")
            return flow_id
            
        raise Exception("No flows found in Langflow")
        
    except Exception as e:
        log(f"Failed to get Flow ID: {e}", "ERROR")
        return None

def save_flow_id(flow_id):
    """Save Flow ID to persistent file"""
    try:
        ensure_data_dir()
        with open(FLOW_ID_FILE, 'w') as f:
            f.write(flow_id)
        log(f"Saved Flow ID to persistent file: {flow_id}", "SUCCESS")
        return True
    except Exception as e:
        log(f"Failed to save Flow ID: {e}", "ERROR")
        return False

def get_stored_flow_id():
    """Get stored Flow ID"""
    try:
        if os.path.exists(FLOW_ID_FILE):
            with open(FLOW_ID_FILE, 'r') as f:
                flow_id = f.read().strip()
                if flow_id:
                    return flow_id
    except Exception as e:
        log(f"Error reading stored Flow ID: {e}", "WARNING")
    return None

def update_backend_env(flow_id):
    """Update backend .env file with new Flow ID - Save to data directory for backend container"""
    try:
        # Since we don't have direct access to backend .env, save to shared data directory
        env_sync_file = "/app/data/backend_env_sync.json"
        
        sync_data = {
            "flow_id": flow_id,
            "timestamp": time.time(),
            "sync_time": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        with open(env_sync_file, 'w') as f:
            json.dump(sync_data, f, indent=2)
        
        log(f"Saved backend env sync data with Flow ID: {flow_id}", "SUCCESS")
        return True
        
    except Exception as e:
        log(f"Failed to save backend env sync: {e}", "ERROR")
        return False

def update_frontend_file(flow_id):
    """Update frontend file info - Save to data directory for frontend container"""
    try:
        # Since we don't have direct access to frontend files, save to shared data directory
        frontend_sync_file = "/app/data/frontend_sync.json"
        
        sync_data = {
            "flow_id": flow_id,
            "timestamp": time.time(),
            "sync_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "target_file": "src/services/langflowApi.ts",
            "pattern": "this.flowId = '[^']+'"
        }
        
        with open(frontend_sync_file, 'w') as f:
            json.dump(sync_data, f, indent=2)
        
        log(f"Saved frontend sync data with Flow ID: {flow_id}", "SUCCESS")
        return True
            
    except Exception as e:
        log(f"Failed to save frontend sync data: {e}", "ERROR")
        return False

def notify_backend_of_change(flow_id):
    """Notify backend service of Flow ID change"""
    try:
        # Try to notify backend through internal API
        payload = {"flow_id": flow_id, "source": "uploader"}
        response = requests.post(
            f"{BACKEND_HOST}/api/internal/flow-id-update",
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            log("Successfully notified backend of Flow ID change", "SUCCESS")
            return True
        else:
            log(f"Backend notification failed: HTTP {response.status_code}", "WARNING")
            return False
            
    except Exception as e:
        log(f"Failed to notify backend: {e}", "WARNING")
        return False

def create_sync_status(flow_id, success_count, total_tasks):
    """Create sync status file"""
    try:
        ensure_data_dir()
        
        status = {
            "timestamp": time.time(),
            "flow_id": flow_id,
            "sync_success": success_count == total_tasks,
            "tasks_completed": success_count,
            "total_tasks": total_tasks,
            "last_sync": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        with open(SYNC_STATUS_FILE, 'w') as f:
            json.dump(status, f, indent=2)
        
        log("Created sync status file", "SUCCESS")
        
    except Exception as e:
        log(f"Failed to create sync status: {e}", "ERROR")

def perform_full_sync():
    """Perform full Flow ID synchronization"""
    log("Starting Flow ID Auto-Sync...", "SYNC")
    
    # Get current Flow ID from Langflow
    current_flow_id = get_current_flow_id()
    if not current_flow_id:
        log("Cannot proceed without Flow ID from Langflow", "ERROR")
        return False
    
    # Check if Flow ID changed
    stored_flow_id = get_stored_flow_id()
    if stored_flow_id == current_flow_id:
        log(f"Flow ID unchanged: {current_flow_id}", "INFO")
    else:
        log(f"Flow ID changed: {stored_flow_id} -> {current_flow_id}", "SYNC")
      # Perform sync tasks
    tasks = [
        ("Save persistent Flow ID", lambda: save_flow_id(current_flow_id)),
        ("Save backend sync data", lambda: update_backend_env(current_flow_id)),
        ("Save frontend sync data", lambda: update_frontend_file(current_flow_id)),
        ("Notify backend service", lambda: notify_backend_of_change(current_flow_id))
    ]
    
    success_count = 0
    
    for task_name, task_func in tasks:
        log(f"Executing: {task_name}", "SYNC")
        try:
            if task_func():
                success_count += 1
            else:
                log(f"Task failed: {task_name}", "WARNING")
        except Exception as e:
            log(f"Task error: {task_name} - {e}", "ERROR")
    
    # Create sync status
    create_sync_status(current_flow_id, success_count, len(tasks))
    
    # Summary
    log("=" * 50, "INFO")
    if success_count == len(tasks):
        log("Flow ID Auto-Sync completed successfully!", "SUCCESS")
    else:
        log(f"Flow ID Auto-Sync completed with {len(tasks) - success_count} warnings", "WARNING")
    
    log(f"Current Flow ID: {current_flow_id}", "INFO")
    log(f"Tasks completed: {success_count}/{len(tasks)}", "INFO")
    log("=" * 50, "INFO")
    
    return success_count == len(tasks)

def main():
    """Main execution"""
    try:
        # Wait for Langflow to be ready
        log("Waiting for Langflow to be ready...")
        max_retries = 60
        for i in range(max_retries):
            try:
                response = requests.get(f"{LANGFLOW_HOST}/api/v1/health", timeout=5)
                if response.status_code == 200:
                    log("Langflow is ready!", "SUCCESS")
                    break
            except:
                pass
            
            if i % 10 == 0:
                log(f"Waiting for Langflow... ({i}/{max_retries}s)")
            time.sleep(1)
        else:
            raise Exception("Langflow not ready within timeout")
        
        # Perform sync
        success = perform_full_sync()
        
        if not success:
            log("Some sync tasks failed, but continuing...", "WARNING")
        
        # Keep container running briefly for debugging
        log("Sync completed. Container will exit in 5 seconds...")
        time.sleep(5)
        
    except Exception as e:
        log(f"Fatal error: {e}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()
