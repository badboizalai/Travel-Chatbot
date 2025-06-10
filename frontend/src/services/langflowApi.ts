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
  private flowId: string;  constructor() {
    // Use the latest working flow ID from the uploader logs
    this.baseUrl = 'http://localhost:8080';
    this.flowId = '89af7a60-9414-4f8d-8176-44d18e8b1766';
  }
  async sendMessage(message: string, sessionId: string = 'user-session'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/run/${this.flowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_value: message,
          session_id: sessionId,
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
}

export const langflowApi = new LangflowApiService();
export default langflowApi;
