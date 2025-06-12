// Langflow API service for TravelMate chatbot
export interface LangflowMessage {
  message: string;
  text?: string;
  sender: string;
  sender_name: string;
  session_id: string;
  timestamp: string;
  files: any[];
  type: string;
}

export interface LangflowResponse {
  session_id: string;
  outputs: Array<{
    inputs: {
      input_value: string;
    };
    outputs: Array<{
      results: {
        message: LangflowMessage;
      };
      artifacts: {
        message: string;
        sender: string;
        sender_name: string;
        files: any[];
        type: string;
      };
      outputs: {
        message: {
          message: string;
          type: string;
        };
      };
      logs: {
        message: any[];
      };
      messages: LangflowMessage[];
    }>;
  }>;
}

class LangflowApiService {
  private baseUrl: string;
  private flowId: string;
  private backendUrl: string;
  constructor() {
    // Use the latest working flow ID from the uploader logs (fallback)
    this.baseUrl = 'http://localhost:8080';
    this.flowId = '032a160c-7ac3-41db-b3ee-cfcf15ccdc8c';
    
    // Xác định backend URL dựa vào environment
    this.backendUrl = this.getBackendUrl();
    
    console.log(`🔧 LangflowApi initialized with backend URL: ${this.backendUrl}`);
    
    // Tự động cập nhật flow ID từ backend khi khởi tạo với retry
    this.initializeFlowIdWithRetry();
  }
  private getBackendUrl(): string {
    // Kiểm tra environment variables từ window object
    const env = (window as any).ENV || {};
    if (env.REACT_APP_API_URL) {
      return env.REACT_APP_API_URL;
    }
    
    // Kiểm tra nếu đang chạy trong Docker container
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      // Trong Docker network, sử dụng service name
      return 'http://travel_backend:8000';
    }
  }

  private async initializeFlowIdWithRetry(): Promise<void> {
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds
    
    while (retryCount < maxRetries) {
      try {
        await this.initializeFlowId();
        console.log('✅ Flow ID initialized successfully');
        
        // Start periodic checking after successful initialization
        this.startPeriodicFlowIdCheck();
        return;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ Flow ID initialization attempt ${retryCount}/${maxRetries} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('❌ Flow ID initialization failed after all retries, using fallback');
          
          // Still start periodic checking even if initial fetch failed
          this.startPeriodicFlowIdCheck();
          return;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  private startPeriodicFlowIdCheck(): void {
    // Check for Flow ID updates every 30 seconds
    setInterval(async () => {
      try {
        await this.initializeFlowId();
      } catch (error) {
        // Silently handle errors during periodic checks
        console.debug('Periodic Flow ID check failed:', error);
      }
    }, 30000);
    
    console.log('🔄 Started periodic Flow ID checking (30s interval)');
  }

  private async initializeFlowId(): Promise<void> {
    try {
      console.log(`🔄 Attempting to fetch flow ID from: ${this.backendUrl}/api/chatbot/flow-id`);
      
      const response = await fetch(`${this.backendUrl}/api/chatbot/flow-id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.flow_id && data.flow_id !== this.flowId) {
          console.log(`🔄 Auto-updating flow ID from ${this.flowId} to ${data.flow_id}`);
          this.flowId = data.flow_id;
        } else {
          console.log(`✅ Flow ID is up to date: ${this.flowId}`);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not auto-update flow ID from backend:', error);
      throw error; // Re-throw for retry logic
    }
  }
  async sendMessage(message: string, sessionId: string = 'user-session', userContext?: any): Promise<string> {
    try {
      // Prepare the message payload
      let messagePayload = message;
      
      // If user context is provided, add it to the message
      if (userContext && userContext.isAuthenticated) {
        const userInfo = [];
        if (userContext.email) userInfo.push(`Email: ${userContext.email}`);
        if (userContext.fullName) userInfo.push(`Tên: ${userContext.fullName}`);
        if (userContext.username) userInfo.push(`Username: ${userContext.username}`);
        
        if (userInfo.length > 0) {
          messagePayload = `[Thông tin người dùng: ${userInfo.join(', ')}]\n\n${message}`;
        }
      }
      
      const response = await fetch(`${this.baseUrl}/api/v1/run/${this.flowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_value: messagePayload,
          session_id: sessionId,
          user_context: userContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LangflowResponse = await response.json();
      
      // Extract the message from the complex response structure
      if (data.outputs && data.outputs.length > 0) {
        const output = data.outputs[0];
        if (output.outputs && output.outputs.length > 0) {
          const result = output.outputs[0];
          
          // Try different paths to get the message
          if (result.artifacts && result.artifacts.message) {
            return result.artifacts.message;
          }
          
          if (result.outputs && result.outputs.message && result.outputs.message.message) {
            return result.outputs.message.message;
          }
          
          // Try getting from results
          if (result.results && result.results.message && result.results.message.text) {
            return result.results.message.text;
          }
          
          // Try getting from messages array
          if (result.messages && result.messages.length > 0) {
            return result.messages[0].message;
          }
        }
      }

      throw new Error('Unexpected response format from Langflow');
    } catch (error) {
      console.error('Langflow API Error:', error);
      throw new Error('Failed to get response from TravelMate AI. Please try again.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/version`);
      return response.ok;
    } catch (error) {
      console.error('Langflow health check failed:', error);
      return false;
    }
  }

  getFlowId(): string {
    return this.flowId;
  }
  updateFlowId(newFlowId: string): void {
    this.flowId = newFlowId;
  }

  async refreshFlowId(): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/api/chatbot/flow-id`);
      if (response.ok) {
        const data = await response.json();
        if (data.flow_id) {
          console.log(`🔄 Refreshed flow ID: ${data.flow_id}`);
          this.flowId = data.flow_id;
          return data.flow_id;
        }
      }
      throw new Error('Could not get flow ID from backend');
    } catch (error) {
      console.error('❌ Failed to refresh flow ID:', error);
      throw error;
    }
  }
}

export const langflowApi = new LangflowApiService();
export default langflowApi;
