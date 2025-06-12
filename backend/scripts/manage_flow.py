#!/usr/bin/env python3
"""
Flow Manager for LangFlow - Đảm bảo flow ID persistent khi restart container
"""
import requests
import os
import time
import json

LANGFLOW_HOST = os.getenv("LANGFLOW_HOST", "http://langflow:8080")
FLOW_FILE_PATH = "/app/TravelMate.json"
FLOW_ID_FILE = "/app/data/flow_id.txt"
FLOW_NAME = "Travel Chatbot"

def ensure_data_dir():
    """Đảm bảo thư mục data tồn tại"""
    os.makedirs("/app/data", exist_ok=True)

def wait_for_langflow(url, timeout=120):
    """Đợi LangFlow sẵn sàng"""
    print(f"🔄 Đang đợi Langflow tại {url} ...")
    for i in range(timeout):
        try:
            r = requests.get(f"{url}/api/v1/health")
            if r.status_code == 200:
                print("✅ Langflow đã sẵn sàng!")
                return True
        except Exception as e:
            if i % 10 == 0:  # Log mỗi 10 giây
                print(f"⏳ Đang đợi LangFlow... ({i}/{timeout}s)")
        time.sleep(1)
    raise Exception("❌ Langflow không sẵn sàng trong thời gian chờ")

def get_stored_flow_id():
    """Lấy flow ID đã lưu"""
    try:
        if os.path.exists(FLOW_ID_FILE):
            with open(FLOW_ID_FILE, 'r') as f:
                flow_id = f.read().strip()
                if flow_id:
                    print(f"📂 Flow ID đã lưu: {flow_id}")
                    return flow_id
    except Exception as e:
        print(f"⚠️ Lỗi đọc flow ID: {e}")
    return None

def save_flow_id(flow_id):
    """Lưu flow ID vào file"""
    try:
        ensure_data_dir()
        with open(FLOW_ID_FILE, 'w') as f:
            f.write(flow_id)
        print(f"💾 Đã lưu flow ID: {flow_id}")
    except Exception as e:
        print(f"⚠️ Lỗi lưu flow ID: {e}")

def check_flow_exists(flow_id):
    """Kiểm tra flow có tồn tại trong LangFlow không"""
    try:
        url = f"{LANGFLOW_HOST}/api/v1/flows/{flow_id}"
        response = requests.get(url)
        if response.status_code == 200:
            flow_data = response.json()
            print(f"✅ Flow {flow_id} tồn tại: {flow_data.get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Flow {flow_id} không tồn tại (HTTP {response.status_code})")
            return False
    except Exception as e:
        print(f"⚠️ Lỗi kiểm tra flow: {e}")
        return False

def get_existing_flows():
    """Lấy danh sách flows hiện có"""
    try:
        url = f"{LANGFLOW_HOST}/api/v1/flows/"
        response = requests.get(url)
        if response.status_code == 200:
            flows = response.json()
            print(f"📋 Tìm thấy {len(flows)} flows trong LangFlow")
            for flow in flows:
                if flow.get('name') == FLOW_NAME:
                    print(f"🎯 Tìm thấy flow '{FLOW_NAME}' với ID: {flow['id']}")
                    return flow['id']
        return None
    except Exception as e:
        print(f"⚠️ Lỗi lấy danh sách flows: {e}")
        return None

def upload_new_flow():
    """Upload flow mới"""
    try:
        print("📤 Đang upload flow mới...")
        url = f"{LANGFLOW_HOST}/api/v1/flows/upload/"
        with open(FLOW_FILE_PATH, 'rb') as f:
            files = {'file': ('TravelMate.json', f, 'application/json')}
            resp = requests.post(url, files=files)
            resp.raise_for_status()
            flows = resp.json()
            if flows and len(flows) > 0 and 'id' in flows[0]:
                flow_id = flows[0]['id']
                print(f"✅ Upload thành công! Flow ID: {flow_id}")
                return flow_id
            else:
                raise Exception("❌ Không tìm thấy flow ID trong response")
    except Exception as e:
        print(f"❌ Lỗi upload flow: {e}")
        raise

def get_or_create_flow():
    """Lấy hoặc tạo flow"""
    # 1. Kiểm tra flow ID đã lưu
    stored_flow_id = get_stored_flow_id()
    if stored_flow_id and check_flow_exists(stored_flow_id):
        return stored_flow_id
    
    # 2. Tìm flow theo tên trong LangFlow
    existing_flow_id = get_existing_flows()
    if existing_flow_id:
        save_flow_id(existing_flow_id)
        return existing_flow_id
    
    # 3. Upload flow mới
    new_flow_id = upload_new_flow()
    save_flow_id(new_flow_id)
    return new_flow_id

def test_flow(flow_id):
    """Test flow hoạt động"""
    try:
        print("🧪 Đang test flow...")
        url = f"{LANGFLOW_HOST}/api/v1/run/{flow_id}"
        payload = {
            "input_value": "Tao muốn đi du lịch với anh em tao",
            "output_type": "chat",
            "input_type": "chat",
            "session_id": "test_session"
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        print("✅ Flow test thành công!")
        print(f"🎯 API endpoint: {LANGFLOW_HOST}/api/v1/run/{flow_id}")
        return True
    except Exception as e:
        print(f"❌ Flow test thất bại: {e}")
        return False

def main():
    """Main function"""
    try:
        print("🚀 Bắt đầu quản lý flow...")
        
        # Đợi LangFlow sẵn sàng
        wait_for_langflow(LANGFLOW_HOST)
        
        # Lấy hoặc tạo flow
        flow_id = get_or_create_flow()
        
        # Test flow
        test_flow(flow_id)
        
        print("=" * 50)
        print(f"✅ HOÀN THÀNH!")
        print(f"📋 Flow ID: {flow_id}")
        print(f"🔗 API endpoint: {LANGFLOW_HOST}/api/v1/run/{flow_id}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        exit(1)

if __name__ == "__main__":
    main()
