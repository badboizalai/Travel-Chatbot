import httpx
import json
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import asyncio

load_dotenv()

class LangflowService:
    def __init__(self):
        self.langflow_host = os.getenv("LANGFLOW_HOST", "http://localhost:8080")
        self.app_token = os.getenv("APP_TOKEN")
        self.flow_id = os.getenv("FLOW_ID")
        self.user_id = os.getenv("USER_ID")
        self.folder_id = os.getenv("FOLDER_ID")
        self._cached_flow_id = None
        
    def get_persistent_flow_id(self) -> Optional[str]:
        """Lấy flow ID từ file persistent và sync data"""
        try:
            # 1. Thử đọc từ uploader persistent file
            flow_id_file = "/app/data/flow_id.txt"
            if os.path.exists(flow_id_file):
                with open(flow_id_file, 'r') as f:
                    flow_id = f.read().strip()
                    if flow_id:
                        print(f"✅ Found persistent flow ID: {flow_id}")
                        return flow_id
            
            # 2. Thử đọc từ backend sync data  
            sync_file = "/app/data/backend_env_sync.json"
            if os.path.exists(sync_file):
                with open(sync_file, 'r') as f:
                    import json
                    sync_data = json.load(f)
                    flow_id = sync_data.get('flow_id')
                    if flow_id:
                        print(f"✅ Found flow ID from sync data: {flow_id}")
                        return flow_id
                        
        except Exception as e:
            print(f"⚠️ Could not read persistent flow ID: {e}")
        return None
    
    async def auto_detect_flow_id(self) -> Optional[str]:
        """Tự động detect flow ID từ LangFlow"""
        try:
            async with httpx.AsyncClient() as client:
                # Lấy danh sách flows
                response = await client.get(f"{self.langflow_host}/api/v1/flows/")
                if response.status_code == 200:
                    flows = response.json()
                    if flows and len(flows) > 0:
                        # Ưu tiên flow có tên "Travel Chatbot"
                        for flow in flows:
                            if flow.get('name') == 'Travel Chatbot':
                                print(f"✅ Auto-detected Travel Chatbot flow ID: {flow['id']}")
                                return flow['id']
                        
                        # Nếu không tìm thấy, lấy flow đầu tiên
                        first_flow = flows[0]
                        print(f"✅ Using first available flow ID: {first_flow['id']}")
                        return first_flow['id']
        except Exception as e:
            print(f"⚠️ Could not auto-detect flow ID: {e}")
        return None
    
    async def get_flow_id(self) -> str:
        """Lấy flow ID với fallback strategy"""
        # 1. Cache
        if self._cached_flow_id:
            return self._cached_flow_id
            
        # 2. Environment variable
        if self.flow_id:
            self._cached_flow_id = self.flow_id
            return self.flow_id
            
        # 3. Persistent file
        persistent_id = self.get_persistent_flow_id()
        if persistent_id:
            self._cached_flow_id = persistent_id
            return persistent_id
              # 4. Auto-detect từ LangFlow
        detected_id = await self.auto_detect_flow_id()
        if detected_id:
            self._cached_flow_id = detected_id
            return detected_id
            
        raise Exception("❌ Could not determine flow ID. Please check LangFlow configuration.")
        
    async def send_message(self, message: str, session_id: Optional[str] = None, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Send message to Langflow and get response with user context"""
        # Lấy flow ID
        flow_id = await self.get_flow_id()
        url = f"{self.langflow_host}/api/v1/run/{flow_id}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Thêm authorization nếu có
        if self.app_token:
            headers["Authorization"] = f"Bearer {self.app_token}"
          # Prepare message with user context
        enhanced_message = message
        if user_context and hasattr(user_context, 'isAuthenticated') and user_context.isAuthenticated:
            user_info = []
            if hasattr(user_context, 'email') and user_context.email:
                user_info.append(f"Email: {user_context.email}")
            if hasattr(user_context, 'fullName') and user_context.fullName:
                user_info.append(f"Tên: {user_context.fullName}")
            if hasattr(user_context, 'username') and user_context.username:
                user_info.append(f"Username: {user_context.username}")
            
            if user_info:
                enhanced_message = f"[Thông tin người dùng: {', '.join(user_info)}]\n\n{message}"
        
        payload = {
            "input_value": enhanced_message,
            "input_type": "chat",
            "output_type": "chat",
            "tweaks": {
                "ChatInput-input_value": enhanced_message
            }
        }
        
        if session_id:
            payload["session_id"] = session_id
              # Add user context to payload for advanced processing
        if user_context:
            # Convert Pydantic model to dict if needed
            if hasattr(user_context, 'dict'):
                payload["user_context"] = user_context.dict()
            else:
                payload["user_context"] = user_context
            
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                
                # Extract the actual response message
                if "outputs" in result and len(result["outputs"]) > 0:
                    output = result["outputs"][0]
                    if "outputs" in output and len(output["outputs"]) > 0:
                        message_output = output["outputs"][0]
                        if "results" in message_output and "message" in message_output["results"]:
                            return {
                                "response": message_output["results"]["message"]["text"],
                                "session_id": result.get("session_id"),
                                "status": "success"
                            }
                
                return {
                    "response": "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
                    "session_id": session_id,
                    "status": "error"
                }
                
        except httpx.TimeoutException:
            return {
                "response": "Kết nối bị timeout. Vui lòng thử lại sau.",
                "session_id": session_id,
                "status": "timeout"
            }
        except httpx.HTTPStatusError as e:
            return {
                "response": f"Lỗi kết nối: {e.response.status_code}",
                "session_id": session_id,
                "status": "error"
            }
        except Exception as e:
            return {
                "response": f"Lỗi hệ thống: {str(e)}",
                "session_id": session_id,
                "status": "error"
            }
    
    async def health_check(self) -> bool:
        """Check if Langflow is running"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.langflow_host}/api/v1/health")
                return response.status_code == 200
        except:
            return False

# Global instance
langflow_service = LangflowService()