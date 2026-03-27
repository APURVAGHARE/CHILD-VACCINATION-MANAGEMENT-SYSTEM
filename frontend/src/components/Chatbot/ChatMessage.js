import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  const getMessageStyle = () => {
    if (message.type === 'welcome') {
      return 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200';
    }
    if (message.type === 'error') {
      return 'bg-red-50 border border-red-200 text-red-800';
    }
    return isBot 
      ? 'bg-white border border-gray-200' 
      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
  };

  const formatMessage = (text) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, index) => {
      // Check if it's a list (contains bullet points)
      if (para.includes('•') || para.includes('- ') || para.includes('* ')) {
        const items = para.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc pl-4 space-y-1 my-2">
            {items.map((item, i) => {
              const cleanItem = item.replace(/^[•\-*]\s*/, '');
              return <li key={i} className="text-sm">{cleanItem}</li>;
            })}
          </ul>
        );
      }
      
      // Check if it's numbered list
      if (para.match(/^\d+\./)) {
        const items = para.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal pl-4 space-y-1 my-2">
            {items.map((item, i) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '');
              return <li key={i} className="text-sm">{cleanItem}</li>;
            })}
          </ol>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-sm leading-relaxed mb-2">
          {para}
        </p>
      );
    });
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} items-end space-x-2 animate-slideIn`}>
      {/* Bot Avatar */}
      {isBot && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
          🤖
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${getMessageStyle()}`}
      >
        <div className="prose prose-sm max-w-none">
          {typeof message.text === 'string' 
            ? formatMessage(message.text)
            : message.text
          }
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </div>
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
          👤
        </div>
      )}
    </div>
  );
};

export default ChatMessage;