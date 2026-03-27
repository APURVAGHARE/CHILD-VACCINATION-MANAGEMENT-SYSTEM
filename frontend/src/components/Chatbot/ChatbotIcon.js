import React from 'react';

const ChatbotIcon = ({ small = false }) => {
  return (
    <svg 
      width={small ? "20" : "24"} 
      height={small ? "20" : "24"} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" 
        fill="currentColor" 
        fillOpacity="0.8"
      />
      <circle cx="9" cy="10" r="2" fill="white" />
      <circle cx="15" cy="10" r="2" fill="white" />
      <path 
        d="M12 14C10.34 14 9 15.34 9 17H15C15 15.34 13.66 14 12 14Z" 
        fill="white" 
      />
    </svg>
  );
};

export default ChatbotIcon;