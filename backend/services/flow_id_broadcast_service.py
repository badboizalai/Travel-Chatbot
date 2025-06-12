import asyncio
import json
import os
from typing import Optional
from datetime import datetime

class FlowIdBroadcastService:
    """Service để broadcast Flow ID changes"""
    
    def __init__(self):
        self.flow_id_file = "/app/data/flow_id.txt"
        self.notification_file = "/app/data/flow_id_changed.json"
        self.current_flow_id: Optional[str] = None
        self.is_running = False
        
    def get_stored_flow_id(self) -> Optional[str]:
        """Lấy Flow ID từ file persistent"""
        try:
            if os.path.exists(self.flow_id_file):
                with open(self.flow_id_file, 'r') as f:
                    flow_id = f.read().strip()
                    return flow_id if flow_id else None
        except Exception as e:
            print(f"⚠️ Error reading flow ID file: {e}")
        return None
    
    def check_for_changes(self) -> bool:
        """Kiểm tra xem Flow ID có thay đổi không"""
        stored_flow_id = self.get_stored_flow_id()
        if stored_flow_id and stored_flow_id != self.current_flow_id:
            old_flow_id = self.current_flow_id
            self.current_flow_id = stored_flow_id
            
            print(f"🔄 Flow ID changed: {old_flow_id} -> {stored_flow_id}")
            
            # Tạo notification
            self.create_notification(old_flow_id, stored_flow_id)
            return True
        return False
    
    def create_notification(self, old_id: Optional[str], new_id: str):
        """Tạo notification file"""
        try:
            notification_data = {
                "timestamp": datetime.now().isoformat(),
                "old_flow_id": old_id,
                "new_flow_id": new_id,
                "message": f"Flow ID updated from {old_id} to {new_id}"
            }
            
            with open(self.notification_file, 'w') as f:
                json.dump(notification_data, f, indent=2)
                
            print(f"📢 Created notification: {self.notification_file}")
            
        except Exception as e:
            print(f"⚠️ Error creating notification: {e}")
    
    async def start_monitoring(self, check_interval: int = 5):
        """Bắt đầu monitoring Flow ID changes"""
        if self.is_running:
            return
            
        self.is_running = True
        print(f"🔍 Starting Flow ID monitoring (interval: {check_interval}s)")
        
        # Initialize current flow ID
        self.current_flow_id = self.get_stored_flow_id()
        print(f"📋 Initial Flow ID: {self.current_flow_id}")
        
        while self.is_running:
            try:
                self.check_for_changes()
                await asyncio.sleep(check_interval)
            except Exception as e:
                print(f"❌ Error during monitoring: {e}")
                await asyncio.sleep(check_interval)
    
    def stop_monitoring(self):
        """Dừng monitoring"""
        self.is_running = False
        print("🛑 Flow ID monitoring stopped")
    
    def get_current_flow_id(self) -> Optional[str]:
        """Lấy Flow ID hiện tại"""
        if not self.current_flow_id:
            self.current_flow_id = self.get_stored_flow_id()
        return self.current_flow_id

# Global instance
flow_id_broadcast_service = FlowIdBroadcastService()
