import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  SparklesIcon,
  HeartIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FaceSmileIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ChatMessage from './ChatMessage';
import ChatbotIcon from './ChatbotIcon';
import { formatBotResponse, getQuickResponse, extractVaccines } from './chatbotHelpers';
import axios from 'axios';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [conversationContext, setConversationContext] = useState([]);
  const [voiceVolume, setVoiceVolume] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Initialize chat with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "👋 Hello! I'm **VaxiCare**, your professional child vaccination assistant. I'm here to help you with any questions about your child's vaccinations! What would you like to know today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'welcome'
      }
    ]);
  }, []);

  // Check if browser supports speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceSupported(false);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Generate suggested questions based on conversation
  useEffect(() => {
    if (messages.length > 1) {
      generateSuggestedQuestions();
    }
  }, [messages]);

  // Clean up audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateSuggestedQuestions = () => {
    const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
    
    if (lastBotMessage) {
      const text = lastBotMessage.text.toLowerCase();
      
      // Context-aware suggestions
      if (text.includes('newborn') || text.includes('birth')) {
        setSuggestedQuestions([
          "When is the first vaccine due?",
          "Is BCG vaccine necessary?",
          "Can hepatitis B be delayed?",
          "What vaccines at birth?"
        ]);
      } else if (text.includes('2 month') || text.includes('two month')) {
        setSuggestedQuestions([
          "What vaccines at 2 months?",
          "Are multiple vaccines safe?",
          "How to handle side effects?",
          "Can vaccines be given late?"
        ]);
      } else if (text.includes('fever') || text.includes('side effect')) {
        setSuggestedQuestions([
          "When to call doctor for fever?",
          "How to reduce fever after vaccine?",
          "Is fussiness normal?",
          "What are serious side effects?"
        ]);
      } else if (text.includes('schedule') || text.includes('due')) {
        setSuggestedQuestions([
          "Can I delay vaccines?",
          "What if I miss a dose?",
          "Catch-up schedule",
          "Vaccine timing guidelines"
        ]);
      } else {
        setSuggestedQuestions([
          "When is first vaccine due?",
          "Are vaccines safe?",
          "Common side effects",
          "2 month vaccines schedule",
          "Fever after vaccination"
        ]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (inputMessage.length > 500) {
      toast.warning('Message too long (max 500 characters)');
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation context
    setConversationContext(prev => [...prev, { role: 'user', content: inputMessage }]);
    
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Check for quick response first
    const quickResponse = getQuickResponse(messageToSend);
    if (quickResponse) {
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          text: quickResponse.response,
          sender: 'bot',
          timestamp: new Date(),
          type: 'response'
        };
        setMessages(prev => [...prev, botMessage]);
        setConversationContext(prev => [...prev, { role: 'assistant', content: quickResponse.response }]);
        setIsTyping(false);
        setShowSuggestions(true);
      }, 1000);
      return;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: messageToSend,
        context: conversationContext.slice(-5) // Send last 5 messages for context
      }, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.data.success && response.data.reply) {
        const formattedReply = formatBotResponse(response.data.reply);
        
        const botMessage = {
          id: messages.length + 2,
          text: formattedReply,
          sender: 'bot',
          timestamp: new Date(),
          type: 'response'
        };

        setMessages(prev => [...prev, botMessage]);
        setConversationContext(prev => [...prev, { role: 'assistant', content: formattedReply }]);
        
        // Extract vaccines mentioned for future suggestions
        const vaccines = extractVaccines(formattedReply);
        if (vaccines.length > 0) {
          console.log('Vaccines mentioned:', vaccines);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Chat error:', error);
      
      let errorMessage = "I'm having trouble connecting. Please try again in a moment.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        switch (error.response.status) {
          case 429:
            errorMessage = "Too many requests. Please wait a moment and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = "Something went wrong. Please try again.";
        }
      } else if (error.request) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running.";
      }
      
      const errorBotMessage = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorBotMessage]);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsTyping(false);
      setShowSuggestions(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Enhanced voice recognition with volume visualization
  const startVoiceRecognition = async () => {
    if (!voiceSupported) {
      toast.info('Voice recognition is not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for volume visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Start volume monitoring
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVoiceVolume(average);
        requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      let finalTranscript = '';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info('🎤 Listening... Speak clearly', { 
          icon: '🎤',
          autoClose: false,
          toastId: 'voice-toast'
        });
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setInputMessage(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceVolume(0);
        
        const errorMessages = {
          'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
          'no-speech': 'No speech detected. Please try again.',
          'network': 'Network error occurred. Check your connection.',
          'aborted': 'Voice recognition was stopped.'
        };
        
        toast.dismiss('voice-toast');
        toast.error(errorMessages[event.error] || 'Voice recognition failed. Please try again.');
        
        // Clean up audio context
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setVoiceVolume(0);
        toast.dismiss('voice-toast');
        
        if (finalTranscript.trim()) {
          toast.success('Voice captured successfully!');
        }
        
        // Clean up audio context
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check your permissions.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceVolume(0);
      toast.dismiss('voice-toast');
      toast.info('Voice recognition stopped');
      
      // Clean up audio context
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 1,
          text: "👋 Chat cleared! I'm still here to help with your vaccination questions. What would you like to know?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'welcome'
        }
      ]);
      setConversationContext([]);
      toast.success('Chat cleared successfully');
    }
  };

  const exportChat = () => {
    const chatText = messages.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}] ${m.sender === 'user' ? '👤 You' : '🤖 VaxiCare'}: ${m.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaccine-chat-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported successfully!');
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

  const quickQuestions = [
    "When is first vaccine due?",
    "2 month vaccines schedule",
    "Are vaccines safe?",
    "Common side effects",
    "Fever after vaccination",
    "Can vaccines be delayed?"
  ];

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-500 z-50
          ${isOpen ? 'rotate-90 bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 hover:scale-110'}`}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 animate-slideUp">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ChatbotIcon />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    VaxiCare
                    <SparklesIcon className="h-4 w-4 ml-2 text-yellow-300" />
                  </h3>
                  <p className="text-xs text-primary-100 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={exportChat}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all"
                  title="Export chat"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={clearChat}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-all"
                  title="Clear chat"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-messages">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <ChatbotIcon small />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && suggestedQuestions.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500 mb-2 flex items-center">
                <LightBulbIcon className="h-3 w-3 mr-1 text-yellow-500" />
                Suggested for you:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Questions (fallback) */}
          {showSuggestions && suggestedQuestions.length === 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500 mb-2 flex items-center">
                <FaceSmileIcon className="h-3 w-3 mr-1" />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your question..."}
                  className={`w-full pl-4 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none transition-all
                    ${isListening ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary-500'}`}
                  rows="1"
                  style={{ maxHeight: '120px' }}
                  disabled={isListening}
                />
                
                {/* Voice Input Button with Volume Visualization */}
                {voiceSupported && (
                  <button
                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                    className={`absolute right-3 bottom-2.5 p-1.5 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {isListening ? (
                      <div className="relative">
                        <StopIcon className="h-5 w-5" />
                        {voiceVolume > 10 && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full animate-ping"></span>
                        )}
                      </div>
                    ) : (
                      <MicrophoneIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`p-3 rounded-xl transition-all ${
                  inputMessage.trim()
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Voice Status Indicator with Wave Animation */}
            {isListening && (
              <div className="mt-2 text-xs text-center text-primary-600 flex items-center justify-center">
                <div className="voice-wave mr-2">
                  <span style={{ height: `${20 + voiceVolume / 10}px` }}></span>
                  <span style={{ height: `${20 + voiceVolume / 10}px` }}></span>
                  <span style={{ height: `${20 + voiceVolume / 10}px` }}></span>
                  <span style={{ height: `${20 + voiceVolume / 10}px` }}></span>
                  <span style={{ height: `${20 + voiceVolume / 10}px` }}></span>
                </div>
                Listening... Speak clearly
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center mt-3">
              <HeartIcon className="h-3 w-3 inline-block mr-1 text-red-400" />
              For informational purposes only. Always consult your pediatrician.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;