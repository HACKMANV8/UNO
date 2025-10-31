// API Configuration
export const config = {
  // Gemini AI API Key
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Gemini API Endpoint
  geminiApiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  
  // Interview Analysis Settings
  analysis: {
    // Speaking pace thresholds (words per minute)
    speakingPace: {
      min: 120,
      max: 160,
      ideal: 140
    },
    
    // Filler words to detect
    fillerWords: [
      'um', 'uh', 'ah', 'like', 'you know', 'basically', 
      'actually', 'so', 'well', 'right', 'okay', 'I mean'
    ],
    
    // Analysis intervals (in milliseconds)
    videoAnalysisInterval: 100,
    audioAnalysisInterval: 500,
    
    // Scoring weights
    scores: {
      visualWeight: 0.35,
      vocalWeight: 0.35,
      linguisticWeight: 0.30
    }
  },
  
  // Video recording settings
  recording: {
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  }
};

// Validation function
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.geminiApiKey) {
    errors.push('Gemini API Key is required. Please add VITE_GEMINI_API_KEY to your .env file.');
  }
  
  if (config.geminiApiKey === 'your_gemini_api_key_here') {
    errors.push('Please replace the placeholder Gemini API key with your actual key.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};