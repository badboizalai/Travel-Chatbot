import React, { useState, useRef, useEffect } from 'react';
import { langflowApi } from '../services/langflowApi';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Enhanced utility function to format message content
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
  
  // Wrap in a container for better spacing
  return `<div class="prose prose-sm max-w-none leading-relaxed">${formatted}</div>`;
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 80;
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    resizeTextarea();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "👋 **Xin chào!** Tôi là TravelMate AI.\n\nHãy hỏi tôi về du lịch Việt Nam!\n\n**Ví dụ:**\n- Điểm du lịch Hà Nội\n- Món ăn miền Trung\n- Lịch trình Sapa",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    resizeTextarea();
  }, [inputMessage]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    
    // Reset textarea height after clearing input
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTimeout(resizeTextarea, 0);
    setIsLoading(true);

    try {
      // Use the real Langflow API
      const aiResponse = await langflowApi.sendMessage(currentInput, 'travel-chat-session');
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "😅 **Xin lỗi!** Tôi đang gặp vấn đề kỹ thuật.\n\nVui lòng thử lại sau! 🔄",
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

  const quickPrompts = [
    { text: 'Gợi ý điểm du lịch nổi tiếng ở Hà Nội', icon: '🏛️', label: 'Hà Nội' },
    { text: 'Món ăn đặc sản miền Nam', icon: '🍜', label: 'Ẩm thực' },
    { text: 'Lịch trình 3 ngày ở Đà Lạt', icon: '📅', label: 'Lịch trình' },
    { text: 'Kinh nghiệm du lịch bụi Việt Nam', icon: '🎒', label: 'Kinh nghiệm' }
  ];

  return (
    <>
      {/* Chat Button - Smaller and more elegant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed 
          bottom-4 right-4 
          z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
          w-12 h-12
          rounded-full shadow-lg
          hover:from-blue-600 hover:to-purple-700 
          transition-all duration-300 hover:scale-110 active:scale-95
          flex items-center justify-center"
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        <div
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>
      </button>

      {/* Chat Window - Optimized size for better UX */}
      {isOpen && (
        <div          className={`fixed 
            bottom-20 right-4 
            z-40 
            w-[480px] h-[576px]
            max-w-[90vw] max-h-[80vh]
            bg-white rounded-xl
            shadow-2xl
            border border-gray-200 
            overflow-hidden flex flex-col 
            transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {/* Header - Compact and clean */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">🤖 TravelMate AI</h3>
                <p className="text-xs opacity-90">Trợ lý du lịch thông minh</p>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Messages - Optimized scrolling area */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0 space-y-2 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'fadeIn 0.3s ease-out' }}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <div 
                    className={`text-sm leading-relaxed ${message.isUser ? 'text-white' : 'text-gray-800'}`}
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(message.content) 
                    }}
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  />
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg rounded-bl-sm shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Streamlined for better usability */}
          <div className="border-t border-gray-200 p-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex space-x-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="💬 Hỏi về du lịch..."
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-[80px] min-h-[40px] transition-all duration-200 bg-white shadow-sm overflow-y-auto text-sm"
                  disabled={isLoading}
                  rows={1}
                  maxLength={300}
                  style={{ 
                    height: 'auto',
                    minHeight: '40px'
                  }}
                />
                {inputMessage.length > 0 && (
                  <div className="absolute bottom-1 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                    {inputMessage.length}/300
                  </div>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                aria-label="Gửi tin nhắn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Quick Actions - Simplified for mobile */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickPrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt.text)}
                  className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-xs hover:bg-gray-50 hover:border-blue-300 transition-colors duration-200 shadow-sm"
                  disabled={isLoading}
                >
                  {prompt.icon} <span className="ml-1">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` }} />
    </>
  );
};

export default ChatWidget;
