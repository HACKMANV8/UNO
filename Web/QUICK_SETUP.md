# 🎯 Quick Setup Guide for Interview Feature

## Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the generated key** (it looks like: `AIzaSyC...`)

## Step 2: Add the API Key

### Option A: Using .env file (Recommended)
1. **Open the `.env` file** in your project root (I've already created it)
2. **Replace** `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
   ```
3. **Save the file**

### Option B: Direct configuration
If you prefer not to use environment variables, you can directly set it in the config file:

1. **Open** `src/config/interview.ts`
2. **Replace** the line:
   ```typescript
   geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
   ```
   **With**:
   ```typescript
   geminiApiKey: 'AIzaSyC_your_actual_api_key_here',
   ```

## Step 3: Test the Feature

1. **Start your development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

2. **Navigate to**: http://localhost:8080/student/dashboard

3. **Click the "Interview" tab**

4. **Check for configuration errors** - if everything is setup correctly, you should see:
   - Camera preview working
   - No red error messages
   - "Start Interview" button enabled

## Step 4: YOLO Model Integration (Optional for now)

Your YOLO model integration points are in `src/lib/interviewAnalysis.ts`:

1. **Find the `loadYOLOModel()` method** (around line 160)
2. **Replace the placeholder** with your actual model loading code
3. **Update the `performYOLOAnalysis()` method** to use your model

Example integration:
```typescript
async loadYOLOModel() {
  // Replace with your model loading code
  const model = await tf.loadLayersModel('/path/to/your/model.json');
  this.model = model;
  return model;
}

private performYOLOAnalysis(imageData: ImageData) {
  // Use your trained YOLO model here
  const predictions = this.model.predict(imageData);
  // Process predictions for body language analysis
}
```

## Step 5: Test Basic Functionality

1. **Enter a role** (e.g., "Software Developer")
2. **Click "Start Interview"**
3. **Answer the AI-generated question**
4. **Click "Stop Interview"** after a few seconds
5. **Review the analysis results**

## Configuration Files Created:

- **`.env`** - Environment variables (API keys)
- **`src/config/interview.ts`** - Main configuration
- **`INTERVIEW_SETUP.md`** - Detailed documentation

## Troubleshooting:

**❌ "Configuration Required" error:**
- Make sure you've added your Gemini API key to the `.env` file
- Restart your development server after adding the API key

**❌ Camera/Microphone not working:**
- Make sure you're using HTTPS (required for getUserMedia)
- Check browser permissions
- Try a different browser (Chrome/Edge work best)

**❌ Speech recognition not working:**
- Currently only works in Chrome and Edge
- Make sure microphone permissions are granted

**✅ Everything working?**
- You should see live transcript during recording
- Analysis events should appear in real-time
- Video playback should work after stopping

## Next Steps:

1. **Test the basic functionality** first
2. **Integrate your YOLO model** for body language analysis
3. **Customize the analysis parameters** in `src/config/interview.ts`
4. **Add more interview question types** if needed

Need help? Check the detailed documentation in `INTERVIEW_SETUP.md`!