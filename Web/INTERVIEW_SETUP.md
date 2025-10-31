# Interview Simulation Setup Guide

## Overview
The new Interview tab provides a comprehensive interview simulation with:
- **Visual Analysis**: Body language, eye contact, posture using your YOLO model
- **Vocal Analysis**: Speaking pace, filler words, pauses using Web Speech API
- **Linguistic Analysis**: Answer quality and content using Gemini AI
- **Interactive Feedback**: Click on events to jump to specific moments in the video

## Setup Instructions

### 1. Gemini API Configuration
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your environment:
   
   **Option A: Environment Variable**
   ```bash
   # Add to your .env file
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Option B: Direct Configuration**
   Update the API key in `src/pages/StudentInterviewSimulationPage.tsx` at line ~72:
   ```typescript
   analysisControllerRef.current = new InterviewAnalysisController(
     videoRef.current!,
     'YOUR_GEMINI_API_KEY', // Replace with your actual API key
     (text) => setTranscript(text),
     (event) => setEvents(prev => [...prev, event])
   );
   ```

### 2. YOLO Model Integration
The system is designed to work with your trained YOLO model. Update the `loadYOLOModel()` method in `src/lib/interviewAnalysis.ts`:

```typescript
async loadYOLOModel() {
  // Replace this with your actual YOLO model loading code
  // Example for TensorFlow.js:
  const model = await tf.loadLayersModel('/path/to/your/yolo/model.json');
  return model;
}
```

And update the `performYOLOAnalysis()` method to use your model:
```typescript
private performYOLOAnalysis(imageData: ImageData) {
  // Use your trained YOLO model here
  // const predictions = await this.model.predict(imageData);
  // Process predictions for body language analysis
}
```

### 3. Browser Permissions
The application requires:
- **Camera access**: For video recording and body language analysis
- **Microphone access**: For voice recording and speech analysis

Make sure to test in a modern browser that supports:
- WebRTC (getUserMedia)
- Web Speech API
- MediaRecorder API

### 4. Features Available

#### Setup Phase
- Camera preview with video/audio controls
- Role/position input for targeted questions
- Real-time permission handling

#### Recording Phase
- Live video feed with recording indicator
- AI-generated questions based on role
- Real-time transcript using Web Speech API
- Live analysis feedback panel
- Event tracking with timestamps

#### Results Phase
- **Scores Tab**: Overall, visual, vocal, and content scores
- **Video Playback Tab**: Recorded interview with event markers
- **Timeline Tab**: Clickable events that jump to specific moments
- **Insights Tab**: Strengths, improvements, and recommendations

#### Analysis Features
- **Filler Word Detection**: Tracks "um", "uh", "like", etc.
- **Speaking Pace Analysis**: Optimal range 120-160 WPM
- **Eye Contact Tracking**: Using your YOLO model
- **Posture Analysis**: Body language scoring
- **Content Quality**: AI-powered answer evaluation

### 5. Free Alternatives Used
- **Speech Recognition**: Web Speech API (instead of Whisper)
- **Video Analysis**: Your trained YOLO model (instead of paid services)
- **AI Content Analysis**: Gemini API (free tier available)
- **Audio Analysis**: Custom implementation using timing and pattern recognition

### 6. Data Privacy
- All video processing happens locally in the browser
- Only text transcripts are sent to Gemini AI for content analysis
- Video recordings are not uploaded anywhere
- Users can download their analysis reports locally

### 7. Browser Compatibility
Tested on:
- Chrome 80+
- Firefox 76+
- Safari 14+
- Edge 80+

### 8. Troubleshooting

**Camera/Microphone not working:**
- Check browser permissions
- Ensure HTTPS connection (required for getUserMedia)
- Test in different browsers

**Speech recognition not working:**
- Currently supports Chrome and Edge (uses webkitSpeechRecognition)
- Firefox support limited

**YOLO model not loading:**
- Check model file paths
- Ensure TensorFlow.js is properly installed
- Verify model format compatibility

**Gemini API errors:**
- Verify API key is correct
- Check API quota and billing
- Ensure proper request format

### 9. Performance Tips
- Use a good quality webcam for better body language analysis
- Ensure stable internet connection for Gemini API calls
- Close other applications using camera/microphone
- Use Chrome for best compatibility

### 10. Next Steps
1. Test the basic functionality with a simple interview
2. Integrate your YOLO model
3. Configure Gemini API key
4. Customize analysis parameters as needed
5. Add additional interview question types
6. Enhance the feedback system based on user needs

The system is now ready for testing and further customization!