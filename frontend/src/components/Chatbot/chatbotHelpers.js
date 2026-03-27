// Format bot response with emojis and better formatting
export const formatBotResponse = (text) => {
  // Add emojis to common topics
  const emojiMap = [
    { pattern: /vaccine/gi, replacement: '💉 vaccine' },
    { pattern: /fever/gi, replacement: '🌡️ fever' },
    { pattern: /baby/gi, replacement: '👶 baby' },
    { pattern: /child/gi, replacement: '🧒 child' },
    { pattern: /doctor/gi, replacement: '👨‍⚕️ doctor' },
    { pattern: /hospital/gi, replacement: '🏥 hospital' },
    { pattern: /appointment/gi, replacement: '📅 appointment' },
    { pattern: /side effect/gi, replacement: '⚠️ side effect' },
    { pattern: /dose/gi, replacement: '💊 dose' },
    { pattern: /schedule/gi, replacement: '📆 schedule' },
    { pattern: /safe/gi, replacement: '🛡️ safe' },
    { pattern: /protect/gi, replacement: '🛡️ protect' },
    { pattern: /health/gi, replacement: '❤️ health' },
    { pattern: /pain/gi, replacement: '😢 pain' },
    { pattern: /swelling/gi, replacement: '🫄 swelling' },
    { pattern: /redness/gi, replacement: '🔴 redness' },
    { pattern: /month/gi, replacement: '📅 month' },
    { pattern: /year/gi, replacement: '🎂 year' },
    { pattern: /emergency/gi, replacement: '🚨 emergency' },
    { pattern: /call/gi, replacement: '📞 call' }
  ];

  let formatted = text;
  emojiMap.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  return formatted;
};

// Extract vaccine names from text
export const extractVaccines = (text) => {
  const vaccineList = [
    'BCG', 'Hepatitis B', 'Hep B', 'Polio', 'IPV', 'OPV',
    'DTaP', 'DTap', 'MMR', 'Rotavirus', 'RV', 'PCV', 
    'Pneumococcal', 'Influenza', 'Flu', 'Chickenpox', 'Varicella',
    'Hepatitis A', 'Hep A', 'Typhoid', 'HPV', 'Meningococcal',
    'Hib', 'Haemophilus influenzae', 'Tdap', 'Tetanus'
  ];
  
  return vaccineList.filter(vaccine => 
    text.toLowerCase().includes(vaccine.toLowerCase())
  );
};

// Quick responses for common questions
export const getQuickResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  // Greetings
  if (lowerMsg.match(/^(hello|hi|hey|greetings)/i)) {
    return {
      type: 'greeting',
      response: "Hello! 👋 I'm VaxiCare, your vaccination assistant. How can I help you with your child's vaccinations today?"
    };
  }
  
  // Thanks
  if (lowerMsg.includes('thank')) {
    return {
      type: 'thanks',
      response: "You're very welcome! 😊 Always happy to help parents keep their children healthy! Is there anything else you'd like to know?"
    };
  }
  
  // Farewell
  if (lowerMsg.match(/bye|goodbye|see you|talk to you later/i)) {
    return {
      type: 'farewell',
      response: "Goodbye! 👋 Take care of your little one! Feel free to come back anytime if you have more questions about vaccinations!"
    };
  }
  
  // Help
  if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
    return {
      type: 'help',
      response: "I can help you with:\n\n• 📅 **Vaccine schedules** - When vaccines are due\n• 💉 **Vaccine information** - What each vaccine is for\n• ⚠️ **Side effects** - What to expect and when to worry\n• 🛡️ **Safety information** - Vaccine safety facts\n• 👨‍⚕️ **When to call doctor** - Warning signs\n• 📋 **Common questions** - Answers to frequent concerns\n\nJust ask me anything about your child's vaccinations!"
    };
  }
  
  // Capabilities
  if (lowerMsg.includes('what can you ask') || lowerMsg.includes('what questions')) {
    return {
      type: 'capabilities',
      response: "You can ask me things like:\n\n• 'When is my baby's first vaccine?'\n• 'What vaccines at 2 months?'\n• 'Are vaccines safe?'\n• 'What are the side effects?'\n• 'My baby has a fever after vaccination'\n• 'Can vaccines be delayed?'\n• 'What is MMR vaccine?'\n• 'When is the next dose due?'"
    };
  }
  
  return null;
};

// Format vaccine names for display
export const formatVaccineName = (vaccine) => {
  const vaccineFullNames = {
    'BCG': 'Bacillus Calmette-Guérin (Tuberculosis)',
    'Hep B': 'Hepatitis B',
    'DTaP': 'Diphtheria, Tetanus, Pertussis',
    'MMR': 'Measles, Mumps, Rubella',
    'PCV': 'Pneumococcal Conjugate Vaccine',
    'Hib': 'Haemophilus influenzae type b',
    'IPV': 'Inactivated Polio Vaccine',
    'OPV': 'Oral Polio Vaccine',
    'RV': 'Rotavirus Vaccine',
    'HPV': 'Human Papillomavirus Vaccine'
  };
  
  return vaccineFullNames[vaccine] || vaccine;
};

// Check if message contains emergency keywords
export const isEmergency = (message) => {
  const emergencyKeywords = [
    'emergency', 'severe', 'unconscious', 'not breathing', 
    'difficulty breathing', 'swollen face', 'swollen lips', 
    'swollen tongue', 'seizure', 'convulsion', 'collapse',
    'high fever', 'over 104', 'not responding', 'blue skin'
  ];
  
  const lowerMsg = message.toLowerCase();
  return emergencyKeywords.some(keyword => lowerMsg.includes(keyword));
};