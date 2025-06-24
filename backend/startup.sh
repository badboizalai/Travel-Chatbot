#!/bin/bash
# Backend startup script with Flow ID sync

echo "[$(date)] Starting backend with Flow ID sync..."

# Sync Flow ID from shared data if available
if [ -f "/app/scripts/sync_flow_id_backend.py" ]; then
    echo "[$(date)] Syncing Flow ID from shared data..."
    python /app/scripts/sync_flow_id_backend.py
fi

# Start the main application
echo "[$(date)] Starting main application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
