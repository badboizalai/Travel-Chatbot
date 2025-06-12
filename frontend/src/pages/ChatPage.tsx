import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { chatService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Enhanced utility function to format message content (same as ChatWidget)
const formatMessage = (content: string) => {
  let formatted = content;
  
  // Replace **text** with bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-700">$1</strong>');
  
  // Replace *text* with italic text  
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
  
  // Replace ### with h3 headers
  formatted = formatted.replace(/###\s*(.*)/g, '<h3 class="text-lg font-bold text-gray-800 mt-3 mb-2 border-l-4 border-blue-500 pl-2">$1</h3>');
  
  // Replace ## with h2 headers
  formatted = formatted.replace(/##\s*(.*)/g, '<h2 class="text-xl font-bold text-gray-900 mt-4 mb-2 border-l-4 border-purple-500 pl-2">$1</h2>');
  
  // Replace # with h1 headers
  formatted = formatted.replace(/#\s*(.*)/g, '<h1 class="text-xl font-bold text-gray-900 mt-4 mb-3 border-b-2 border-blue-300 pb-2">$1</h1>');
  
  // Format numbered lists (1. 2. 3.)
  formatted = formatted.replace(/^\d+\.\s*(.*)/gm, '<div class="ml-3 mb-1.5 pl-2 border-l-2 border-blue-200"><span class="font-semibold text-blue-600 mr-2">▶</span>$1</div>');
  
  // Format bullet points (- or *)
  formatted = formatted.replace(/^[-*]\s*(.*)/gm, '<div class="ml-3 mb-1.5 pl-2"><span class="text-blue-600 mr-2 font-bold">•</span>$1</div>');
  
  // Convert URLs to clickable links with better styling
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-blue-600 hover:text-blue-800 underline font-medium bg-blue-50 px-1.5 py-0.5 rounded text-sm transition-colors duration-200 mx-0.5"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>Link</a>');
  
  // Format email addresses
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  formatted = formatted.replace(emailRegex, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">📧 $1</a>');
  
  // Format phone numbers (Vietnamese format)
  formatted = formatted.replace(/(\+84|0)([0-9]{9,10})/g, '<span class="inline-flex items-center font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-sm mx-0.5">📞 $1$2</span>');
  
  // Replace line breaks and double line breaks
  formatted = formatted.replace(/\n\n/g, '<div class="my-2"></div>');
  formatted = formatted.replace(/\n/g, '<br class="my-0.5">');
  
  return formatted;
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user info from auth hook
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    // Check backend status and load chat history
    checkBackendStatus();
    loadChatHistory();
    
    // Add welcome message with user context
    if (messages.length === 0) {
      const userName = user?.full_name || user?.username || 'bạn';
      const userEmail = user?.email;
      
      let welcomeContent = `👋 **Xin chào ${userName}!** Chào mừng đến với TravelMate AI Chat.\n\n`;
      
      if (userEmail) {
        welcomeContent += `📧 Tôi đã ghi nhận email của bạn: **${userEmail}**\n\n`;
      }
      
      welcomeContent += `Hãy hỏi tôi về du lịch Việt Nam!`;
      
      const welcomeMessage: Message = {
        id: 'welcome',
        content: welcomeContent,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const checkBackendStatus = async () => {
    try {
      const response = await api.get('/health');
      setChatStatus('online');
    } catch (error) {
      console.error('Failed to check backend status:', error);
      setChatStatus('offline');
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/chatbot/history');
      const history = response.data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create user context
      const userContext = {
        userId: user?.id,
        email: user?.email,
        username: user?.username,
        fullName: user?.full_name,
        isAuthenticated: !!user
      };
      
      // Use chatService with user context
      const response = await chatService.sendMessage(messageToSend, userContext, 'chat-page-session');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Xin lỗi, tôi gặp vấn đề kỹ thuật. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">TravelMate Chat</h1>
              <p className="text-gray-600">Ask me anything about travel, weather, bookings!</p>
            </div>            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                chatStatus === 'online' ? 'bg-green-500' : 
                chatStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                AI {chatStatus === 'checking' ? 'Đang kiểm tra...' : chatStatus === 'online' ? 'Trực tuyến' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">✈️</div>
              <p>Welcome to TravelMate! How can I help you plan your trip today?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div 
                      className="text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  )}
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
