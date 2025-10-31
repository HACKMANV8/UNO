# Interview Simulation Debug Guide

## Issues Fixed

### 1. Video Preview Not Showing
**Problem**: Camera preview disappears during recording phase
**Solution**: 
- Added explicit video.play() call during interview start
- Enhanced video stream persistence during state changes
- Added comprehensive logging for video stream status

### 2. YOLO Model Not Detecting Faces
**Problem**: YOLO emotion detection not working during recording
**Solution**:
- Added video readiness checks (readyState, paused, ended)
- Enhanced frame analysis with proper video dimension validation
- Added comprehensive logging for debugging video capture

### 3. Transcript Not Working
**Problem**: Web Speech API not generating transcripts
**Solution**:
- Added proper speech recognition event handlers (onstart, onend, onerror)
- Implemented automatic restart on speech recognition end
- Added permission error handling and fallback behavior

## Debugging Steps

### 1. Test Video Stream
1. Open browser developer console (F12)
2. Navigate to Student Dashboard → Interview tab
3. Click "Start Practice Interview"
4. Look for these console messages:
   ```
   📷 Requesting camera and microphone access...
   ✅ Media initialized successfully
   📹 Video metadata loaded: [width] x [height]
   ```

### 2. Test Interview Start
1. Enter a role (e.g., "Software Developer")
2. Click "Start Interview"
3. Look for these console messages:
   ```
   🎬 Starting interview...
   ▶️ Video element playing
   📹 Video recording started
   🤖 Analysis started
   🎤 Starting speech recognition...
   ✅ Speech recognition started successfully
   ❓ Generating first question...
   ✅ Question generated: [question text]
   ```

### 3. Test YOLO Detection
During recording, look for these messages:
```
🖼️ Analyzing frame: [width] x [height]
😊 Emotion detected: [emotion] (confidence: [score])
```

### 4. Test Speech Recognition
Speak clearly during the interview and look for:
```
✅ Speech recognition started successfully
📝 Transcript updated: [your speech]
```

## Common Issues & Solutions

### Video Not Playing
- **Symptom**: Black video preview or "Video not ready" messages
- **Check**: Browser permissions for camera access
- **Solution**: Refresh page and grant camera permissions

### Speech Recognition Not Working
- **Symptom**: No transcript appearing despite speaking
- **Check**: Browser permissions for microphone access
- **Solution**: Enable microphone permissions and ensure you're using Chrome/Edge

### YOLO Not Detecting
- **Symptom**: No emotion detection events in console
- **Check**: Ensure your face is visible and well-lit
- **Solution**: Adjust lighting and position face clearly in camera view

### API Errors
- **Symptom**: Questions not generating or generic fallback questions
- **Check**: Internet connection and Gemini API key configuration
- **Solution**: Verify API key in firebase.ts configuration

## Browser Compatibility

**Recommended**: Chrome/Chromium-based browsers
**Supported**: Edge, Firefox (limited Web Speech API support)
**Not Supported**: Internet Explorer, Safari (limited features)

## Performance Tips

1. **Good Lighting**: Ensure face is well-lit for better YOLO detection
2. **Clear Speech**: Speak clearly and at moderate pace for better transcription
3. **Stable Camera**: Keep camera steady for consistent video analysis
4. **Close Other Tabs**: Free up browser resources for smooth analysis

## Testing Checklist

- [ ] Camera preview shows during setup
- [ ] Video continues playing during recording
- [ ] Speech recognition activates (check console)
- [ ] YOLO emotion detection runs (check console)
- [ ] Questions generate successfully
- [ ] Transcript updates in real-time
- [ ] Recording can be stopped and replayed
- [ ] Results show comprehensive analysis

## If Issues Persist

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Network**: Ensure stable internet for API calls
3. **Update Browser**: Use latest Chrome/Edge version
4. **Check Console**: Look for any error messages not covered above
5. **Restart Development Server**: Stop and restart `npm run dev`

Remember: All functionality is now heavily logged to the console for debugging!