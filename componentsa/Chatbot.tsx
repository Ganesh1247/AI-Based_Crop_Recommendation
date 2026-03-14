import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { getChatbotResponse, ChatMessage } from '../lib/services/chatbot';
import { useLanguage } from '../lib/context/LanguageContext';

export function Chatbot() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: Date.now().toString(),
        text: t('chat.greeting'),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      setSuggestions([
        "Tell me about rice cultivation",
        "How to improve soil health?",
        "Best irrigation methods",
        "Pest management tips"
      ]);
    }
  }, [isOpen, messages.length, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      // Get chatbot response
      const response = await getChatbotResponse(text);
      
      if (response.success && response.data) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        
        if (response.data.suggestions) {
          setSuggestions(response.data.suggestions);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble understanding your question. Could you please rephrase it?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestions([]);
    // Re-add greeting
    const greetingMessage: ChatMessage = {
      id: Date.now().toString(),
      text: t('chat.greeting'),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
    setSuggestions([
      "Tell me about rice cultivation",
      "How to improve soil health?",
      "Best irrigation methods",
      "Pest management tips"
    ]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 glass-card shadow-2xl border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-14' : 'h-[32rem]'
      }`}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm">{t('chat.title')}</CardTitle>
                {!isMinimized && (
                  <p className="text-xs text-white/80 mt-0.5">{t('chat.subtitle')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-full flex flex-col bg-white dark:bg-slate-900">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 h-80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${
                      message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        message.isUser 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {message.isUser ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-xl p-3 shadow-sm ${
                          message.isUser
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className={`text-[10px] mt-1.5 ${
                          message.isUser ? 'text-white/70 text-right' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs p-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-600">
                  Press Enter to send
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear chat
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}