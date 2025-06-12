#!/bin/sh
# Frontend startup script with Flow ID sync

echo "[$(date)] Starting frontend with Flow ID sync..."

# Sync Flow ID from shared data if available
if [ -f "/app/scripts/sync_flow_id_frontend.js" ]; then
    echo "[$(date)] Syncing Flow ID from shared data..."
    node /app/scripts/sync_flow_id_frontend.js
fi

# Start the main application
echo "[$(date)] Starting React development server..."
exec npm start
