#!/usr/bin/env python3
"""
Backend Flow ID Sync Helper
Reads Flow ID from shared data directory and updates backend .env
"""
import json
import os
import time
import sys

def log(message):
    """Simple logging"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def read_flow_id_from_data():
    """Read Flow ID from shared data directory"""
    try:
        # Check for flow ID from uploader
        flow_id_file = "/app/data/flow_id.txt"
        if os.path.exists(flow_id_file):
            with open(flow_id_file, 'r') as f:
                flow_id = f.read().strip()
                if flow_id:
                    return flow_id
        
        # Check for sync data from flow_sync container
        sync_file = "/app/data/backend_env_sync.json"
        if os.path.exists(sync_file):
            with open(sync_file, 'r') as f:
                sync_data = json.load(f)
                return sync_data.get('flow_id')
        
        return None
        
    except Exception as e:
        log(f"Error reading Flow ID from data: {e}")
        return None

def update_env_file(flow_id):
    """Update .env file with Flow ID"""
    try:
        env_file = "/app/.env"
        
        # Read current content
        content = ""
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                content = f.read()
        
        # Update or add FLOW_ID
        lines = content.split('\n') if content else []
        flow_id_updated = False
        
        for i, line in enumerate(lines):
            if line.startswith('FLOW_ID='):
                lines[i] = f'FLOW_ID={flow_id}'
                flow_id_updated = True
                break
        
        if not flow_id_updated:
            lines.append(f'FLOW_ID={flow_id}')
        
        # Write back
        with open(env_file, 'w') as f:
            f.write('\n'.join(lines))
        
        log(f"Updated .env with Flow ID: {flow_id}")
        return True
        
    except Exception as e:
        log(f"Failed to update .env: {e}")
        return False

def main():
    """Main function"""
    try:
        flow_id = read_flow_id_from_data()
        if flow_id:
            if update_env_file(flow_id):
                log("Backend Flow ID sync completed successfully")
            else:
                log("Failed to update backend .env file")
                sys.exit(1)
        else:
            log("No Flow ID found in shared data directory")
            sys.exit(1)
            
    except Exception as e:
        log(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
