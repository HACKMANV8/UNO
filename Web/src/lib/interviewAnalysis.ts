// Interview Analysis Utilities
import { config } from '@/config/interview';
import { YOLOEmotionAnalyzer, EmotionAnalysis } from './yoloBodyLanguage';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface AnalysisEvent {
  timestamp: number;
  type: 'filler_word' | 'long_pause' | 'eye_contact_lost' | 'posture_change' | 'speaking_pace';
  description: string;
  severity: 'low' | 'medium' | 'high';
  value?: number;
}

export interface InterviewAnalysis {
  visualScore: number;
  vocalScore: number;
  linguisticScore: number;
  overallScore: number;
  events: AnalysisEvent[];
  summary: {
    totalFillerWords: number;
    averagePauseDuration: number;
    averageSpeakingPace: number; // words per minute
    eyeContactPercentage: number;
    postureScore: number;
  };
}

// Voice Analysis using Web Speech API and timing
export class VoiceAnalyzer {
  private recognition: any | null = null;
  private isListening = false;
  private transcript = '';
  private startTime = 0;
  private events: AnalysisEvent[] = [];
  private wordCount = 0;
  private fillerWords = config.analysis.fillerWords;

  constructor(private onTranscript: (text: string) => void, private onEvent: (event: AnalysisEvent) => void) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.analyzeText(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcript = finalTranscript;
      this.onTranscript(finalTranscript + interimTranscript);
    };

    this.recognition.onstart = () => {
      console.log('✅ Speech recognition started successfully');
    };

    this.recognition.onend = () => {
      console.log('⏹️ Speech recognition ended');
      // Restart if still listening
      if (this.isListening) {
        console.log('🔄 Restarting speech recognition...');
        try {
          this.recognition?.start();
        } catch (error) {
          console.error('❌ Failed to restart speech recognition:', error);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        console.error('🚫 Microphone permission denied');
      } else if (event.error === 'no-speech') {
        console.log('🤫 No speech detected, continuing...');
      }
    };
  }

  private analyzeText(text: string) {
    const words = text.toLowerCase().split(/\s+/);
    this.wordCount += words.length;

    // Check for filler words
    words.forEach((word, index) => {
      if (this.fillerWords.includes(word)) {
        const event: AnalysisEvent = {
          timestamp: Date.now() - this.startTime,
          type: 'filler_word',
          description: `Used filler word: "${word}"`,
          severity: 'medium'
        };
        this.events.push(event);
        this.onEvent(event);
      }
    });

    // Calculate speaking pace (words per minute)
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const currentPace = this.wordCount / elapsedMinutes;
    
    if (currentPace < config.analysis.speakingPace.min) {
      const event: AnalysisEvent = {
        timestamp: Date.now() - this.startTime,
        type: 'speaking_pace',
        description: `Speaking pace is slow (ideal: ${config.analysis.speakingPace.min}-${config.analysis.speakingPace.max} WPM)`,
        severity: 'medium',
        value: currentPace
      };
      this.events.push(event);
      this.onEvent(event);
    } else if (currentPace > config.analysis.speakingPace.max) {
      const event: AnalysisEvent = {
        timestamp: Date.now() - this.startTime,
        type: 'speaking_pace',
        description: `Speaking pace is too fast (ideal: ${config.analysis.speakingPace.min}-${config.analysis.speakingPace.max} WPM)`,
        severity: 'high',
        value: currentPace
      };
      this.events.push(event);
      this.onEvent(event);
    }
  }

  start() {
    if (!this.recognition) {
      console.error('❌ Speech recognition not supported in this browser');
      throw new Error('Speech recognition not supported');
    }
    
    console.log('🎤 Starting speech recognition...');
    this.isListening = true;
    this.startTime = Date.now();
    this.transcript = '';
    this.wordCount = 0;
    this.events = [];
    
    try {
      this.recognition.start();
      console.log('✅ Speech recognition started');
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      // Don't throw error, just log it so the interview can continue
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  getAnalysis(): Partial<InterviewAnalysis> {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const averagePace = this.wordCount / elapsedMinutes;
    const fillerWordCount = this.events.filter(e => e.type === 'filler_word').length;

    return {
      events: this.events,
      summary: {
        totalFillerWords: fillerWordCount,
        averagePauseDuration: 0, // Would need pause detection
        averageSpeakingPace: averagePace,
        eyeContactPercentage: 0,
        postureScore: 0
      }
    };
  }
}

// Video Analysis using YOLO model
export class VideoAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private events: AnalysisEvent[] = [];
  private startTime = 0;
  private eyeContactTime = 0;
  private totalAnalysisTime = 0;
  private yoloAnalyzer: YOLOEmotionAnalyzer;
  private analysisInterval: NodeJS.Timeout | null = null;
  private isAnalyzing = false;

  constructor(video: HTMLVideoElement, private onEvent: (event: AnalysisEvent) => void) {
    this.video = video;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.yoloAnalyzer = new YOLOEmotionAnalyzer();
  }

  async loadYOLOModel() {
    console.log('🤖 Loading your YOLO model for emotion detection...');
    const success = await this.yoloAnalyzer.loadModel();
    
    if (success) {
      console.log('✅ YOLO emotion detection model loaded and ready!');
      console.log('📊 Model info:', this.yoloAnalyzer.getModelInfo());
      console.log('🎭 Detectable emotions: Anger, Contempt, Disgust, Fear, Happy, Neutral, Sad, Surprise');
    } else {
      console.error('❌ Failed to load YOLO model. Check the setup guide.');
    }
    
    return success;
  }

  start() {
    this.startTime = Date.now();
    this.events = [];
    this.eyeContactTime = 0;
    this.totalAnalysisTime = 0;
    this.isAnalyzing = true;
    
    console.log('🎬 Starting video analysis...');
    console.log('📹 Video element:', this.video);
    console.log('📐 Video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
    
    // Wait a moment for video to stabilize, then start analysis
    setTimeout(() => {
      if (this.isAnalyzing) {
        console.log('🔄 Starting analysis interval...');
        this.analysisInterval = setInterval(() => {
          this.analyzeFrame();
        }, config.analysis.videoAnalysisInterval);
      }
    }, 1000); // Wait 1 second for video to stabilize
  }

  private async analyzeFrame() {
    if (!this.video || this.video.paused || !this.isAnalyzing) {
      console.log('⏸️ Video analysis paused:', {
        hasVideo: !!this.video,
        isPaused: this.video?.paused,
        isAnalyzing: this.isAnalyzing
      });
      return;
    }

    // Check if video has valid dimensions
    if (!this.video.videoWidth || !this.video.videoHeight) {
      console.log('📐 Video dimensions not ready:', this.video.videoWidth, 'x', this.video.videoHeight);
      return;
    }

    try {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx.drawImage(this.video, 0, 0);

      // Get image data for analysis
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Check if we have valid image data
      if (imageData.data.length === 0) {
        console.log('❌ No image data captured');
        return;
      }

      console.log('🖼️ Analyzing frame:', this.canvas.width, 'x', this.canvas.height);
      
      // Run YOLO analysis
      await this.performYOLOAnalysis(imageData);
      
    } catch (error) {
      console.error('❌ Error in frame analysis:', error);
    }
  }

  private async performYOLOAnalysis(imageData: ImageData) {
    try {
      // Run YOLO analysis on the current frame
      const analysis = await this.yoloAnalyzer.analyzeFrame(imageData);
      
      if (analysis) {
        this.processEmotionAnalysis(analysis);
      }
      
      this.totalAnalysisTime += config.analysis.videoAnalysisInterval;
    } catch (error) {
      console.error('Error in YOLO analysis:', error);
      // Fallback to simulated analysis if YOLO fails
      const simulatedResults = this.simulateBodyLanguageAnalysis();
      simulatedResults.forEach(result => {
        const event: AnalysisEvent = {
          timestamp: Date.now() - this.startTime,
          type: result.type as any,
          description: result.description,
          severity: result.severity as any
        };
        this.events.push(event);
        this.onEvent(event);
      });
      this.totalAnalysisTime += config.analysis.videoAnalysisInterval;
    }
  }

  private processEmotionAnalysis(analysis: EmotionAnalysis) {
    const currentTime = Date.now() - this.startTime;

    // Process concerning emotions
    if (analysis.interview_suitability.concerning_emotions.length > 0) {
      analysis.interview_suitability.concerning_emotions.forEach(emotion => {
        const event: AnalysisEvent = {
          timestamp: currentTime,
          type: 'posture_change', // Using existing event type for compatibility
          description: `${emotion} detected - try to maintain composure`,
          severity: this.getEmotionSeverity(emotion)
        };
        this.events.push(event);
        this.onEvent(event);
      });
    }

    // Process low confidence
    if (analysis.confidence.level === 'low') {
      const event: AnalysisEvent = {
        timestamp: currentTime,
        type: 'posture_change',
        description: 'Low confidence detected - take a deep breath and speak clearly',
        severity: 'medium'
      };
      this.events.push(event);
      this.onEvent(event);
    }

    // Process low engagement
    if (analysis.engagement.score < 50) {
      const event: AnalysisEvent = {
        timestamp: currentTime,
        type: 'posture_change',
        description: 'Low engagement detected - try to show more enthusiasm',
        severity: 'medium'
      };
      this.events.push(event);
      this.onEvent(event);
    }

    // Process interview suitability issues
    if (analysis.interview_suitability.score < 40) {
      const event: AnalysisEvent = {
        timestamp: currentTime,
        type: 'posture_change',
        description: 'Interview performance needs improvement - check facial expressions',
        severity: 'high'
      };
      this.events.push(event);
      this.onEvent(event);
    }

    // Update eye contact time based on engagement (approximation)
    if (analysis.engagement.score > 60) {
      this.eyeContactTime += config.analysis.videoAnalysisInterval;
    }
  }

  private getEmotionSeverity(emotion: string): 'low' | 'medium' | 'high' {
    switch (emotion) {
      case 'Anger':
      case 'Contempt':
      case 'Disgust':
        return 'high';
      case 'Fear':
      case 'Sad':
        return 'medium';
      case 'Surprise':
        return 'low';
      default:
        return 'medium';
    }
  }

  private simulateBodyLanguageAnalysis() {
    // Placeholder simulation - replace with actual YOLO model results
    const results = [];
    
    if (Math.random() < 0.1) { // 10% chance of detecting lost eye contact
      results.push({
        type: 'eye_contact_lost',
        description: 'Eye contact lost - look at the camera',
        severity: 'medium'
      });
    } else {
      this.eyeContactTime += 100;
    }

    if (Math.random() < 0.05) { // 5% chance of detecting poor posture
      results.push({
        type: 'posture_change',
        description: 'Posture: sit up straight for better presence',
        severity: 'low'
      });
    }

    return results;
  }

  stop() {
    this.isAnalyzing = false;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  getAnalysis(): Partial<InterviewAnalysis> {
    const eyeContactPercentage = this.totalAnalysisTime > 0 
      ? (this.eyeContactTime / this.totalAnalysisTime) * 100 
      : 0;

    return {
      events: this.events,
      summary: {
        totalFillerWords: 0,
        averagePauseDuration: 0,
        averageSpeakingPace: 0,
        eyeContactPercentage,
        postureScore: Math.min(100, eyeContactPercentage + 20) // Simple scoring
      }
    };
  }
}

// Gemini AI Integration for Content Analysis
export class ContentAnalyzer {
  private apiKey: string;
  private conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateQuestion(role: string, previousAnswers: string[] = []): Promise<string> {
    const prompt = `You are conducting a professional interview for a ${role} position. 
${previousAnswers.length > 0 ? `Based on the candidate's previous answers: ${previousAnswers.join('. ')}, ` : ''}
Generate a relevant follow-up interview question that tests their technical knowledge, problem-solving skills, or experience.
Keep it professional and specific to the role. Return only the question.`;

    try {
      const response = await fetch(`${config.geminiApiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      // Check if response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('Invalid API response structure');
      }
      
      const question = data.candidates[0].content.parts[0].text.trim();
      
      this.conversationHistory.push({ role: 'assistant', content: question });
      return question;
    } catch (error) {
      console.error('Error generating question:', error);
      // Provide role-specific fallback questions
      const fallbackQuestions = {
        'software developer': "Tell me about a challenging bug you've encountered and how you debugged it.",
        'data scientist': "Describe a complex data analysis project you've worked on.",
        'product manager': "How would you prioritize features for a new product?",
        'designer': "Walk me through your design process for a recent project.",
        'default': "Tell me about yourself and why you're interested in this position."
      };
      
      const roleKey = role.toLowerCase();
      for (const [key, question] of Object.entries(fallbackQuestions)) {
        if (roleKey.includes(key)) {
          return question;
        }
      }
      
      return fallbackQuestions.default;
    }
  }

  async analyzeAnswer(answer: string, question: string): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    const prompt = `Analyze this interview answer for a professional job interview:

Question: "${question}"
Answer: "${answer}"

Provide a JSON response with:
- score (0-100): Overall quality of the answer
- feedback: Brief overall assessment
- strengths: Array of positive aspects
- improvements: Array of areas for improvement

Focus on content quality, structure, relevance, and professionalism.`;

    try {
      const response = await fetch(`${config.geminiApiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text.trim();
      
      // Try to parse JSON response
      try {
        const analysis = JSON.parse(analysisText);
        this.conversationHistory.push({ role: 'user', content: answer });
        return analysis;
      } catch {
        // Fallback if JSON parsing fails
        return {
          score: 70,
          feedback: "Good answer with room for improvement",
          strengths: ["Clear communication"],
          improvements: ["Add more specific examples"]
        };
      }
    } catch (error) {
      console.error('Error analyzing answer:', error);
      return {
        score: 70,
        feedback: "Unable to analyze at this time",
        strengths: ["Provided a response"],
        improvements: ["Try to be more specific"]
      };
    }
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  reset() {
    this.conversationHistory = [];
  }
}

// Combined Analysis Controller
export class InterviewAnalysisController {
  private voiceAnalyzer: VoiceAnalyzer;
  private videoAnalyzer: VideoAnalyzer;
  private contentAnalyzer: ContentAnalyzer;
  private events: AnalysisEvent[] = [];
  private isRecording = false;

  constructor(
    video: HTMLVideoElement,
    geminiApiKey: string,
    onTranscript: (text: string) => void,
    onEvent: (event: AnalysisEvent) => void
  ) {
    this.voiceAnalyzer = new VoiceAnalyzer(onTranscript, (event) => {
      this.events.push(event);
      onEvent(event);
    });
    
    this.videoAnalyzer = new VideoAnalyzer(video, (event) => {
      this.events.push(event);
      onEvent(event);
    });
    
    this.contentAnalyzer = new ContentAnalyzer(geminiApiKey);
  }

  async startAnalysis() {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.events = [];
    
    await this.videoAnalyzer.loadYOLOModel();
    this.voiceAnalyzer.start();
    this.videoAnalyzer.start();
  }

  stopAnalysis() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    this.voiceAnalyzer.stop();
    this.videoAnalyzer.stop();
  }

  async generateQuestion(role: string): Promise<string> {
    const answers = this.contentAnalyzer.getConversationHistory()
      .filter(entry => entry.role === 'user')
      .map(entry => entry.content);
    
    return await this.contentAnalyzer.generateQuestion(role, answers);
  }

  async analyzeAnswer(answer: string, question: string) {
    return await this.contentAnalyzer.analyzeAnswer(answer, question);
  }

  getCompleteAnalysis(): InterviewAnalysis {
    const voiceAnalysis = this.voiceAnalyzer.getAnalysis();
    const videoAnalysis = this.videoAnalyzer.getAnalysis();
    
    const vocalScore = Math.max(0, 100 - (voiceAnalysis.summary!.totalFillerWords * 5));
    const visualScore = (videoAnalysis.summary!.eyeContactPercentage + videoAnalysis.summary!.postureScore) / 2;
    const linguisticScore = 75; // Would be calculated from content analysis
    
    return {
      visualScore,
      vocalScore,
      linguisticScore,
      overallScore: (visualScore + vocalScore + linguisticScore) / 3,
      events: this.events,
      summary: {
        totalFillerWords: voiceAnalysis.summary!.totalFillerWords,
        averagePauseDuration: voiceAnalysis.summary!.averagePauseDuration,
        averageSpeakingPace: voiceAnalysis.summary!.averageSpeakingPace,
        eyeContactPercentage: videoAnalysis.summary!.eyeContactPercentage,
        postureScore: videoAnalysis.summary!.postureScore
      }
    };
  }

  reset() {
    this.events = [];
    this.contentAnalyzer.reset();
  }
}