import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, Loader2, User, Bot, Lightbulb, Code, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import { API_URL } from '../api';
import axios from 'axios';

const AIAssistant = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    // Welcome message on mount
    if (chatHistory.length === 0) {
      setChatHistory([{
        type: 'ai',
        message: "👋 Hi! I'm your AI development assistant. I can help you analyze your coding patterns, productivity, and provide insights about your GitHub activity. Ask me anything!",
        timestamp: new Date()
      }]);
    }
  }, []);

  const quickPrompts = [
    {
      icon: TrendingUp,
      text: "Analyze my productivity trends",
      color: "blue"
    },
    {
      icon: Code,
      text: "What languages should I focus on?",
      color: "purple"
    },
    {
      icon: Lightbulb,
      text: "Suggest areas for improvement",
      color: "yellow"
    },
    {
      icon: Clock,
      text: "What are my peak coding hours?",
      color: "green"
    }
  ];

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date() }]);
    setChatLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/ai/chat`, 
        { message: userMessage },
        { withCredentials: true }
      );

      setIsTyping(false);

      if (response.data.success) {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: response.data.data.response,
          suggestions: response.data.data.suggestions,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        message: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setChatMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Brain className="w-10 h-10 text-blue-400" />
            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-outfit">
              AI Assistant
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your personal development insights companion</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex gap-4 ${chat.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                chat.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : chat.type === 'error'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                {chat.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : chat.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${chat.type === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`rounded-2xl px-5 py-3 ${
                  chat.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : chat.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                  
                  {/* Suggestions */}
                  {chat.suggestions && chat.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <p className="text-xs text-gray-400 font-semibold">Related suggestions:</p>
                      {chat.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPrompt(suggestion)}
                          className="block w-full text-left text-xs px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1 px-1">
                  {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        {chatHistory.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Quick Start</p>
            <div className="grid grid-cols-2 gap-3">
              {quickPrompts.map((prompt, idx) => {
                const Icon = prompt.icon;
                const colorClasses = {
                  blue: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-400',
                  purple: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-400',
                  yellow: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400',
                  green: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-400',
                };
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${colorClasses[prompt.color]}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium text-left">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleChat} className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything about your development patterns..."
              disabled={chatLoading}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chatLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 px-1">
            💡 Tip: Ask about productivity, coding patterns, or get personalized recommendations
          </p>
        </form>
      </Card>
    </div>
  );
};

export default AIAssistant;
