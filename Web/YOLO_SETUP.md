# 🔥 YOLO Model Setup Guide (.pt to Web)

## Step 1: Convert Your .pt Model to ONNX

Your YOLO model needs to be converted from PyTorch (.pt) to ONNX format to run in the browser.

### Method 1: Using Ultralytics (Recommended)

```bash
# Install ultralytics if you haven't already
pip install ultralytics

# Convert your model (replace 'best.pt' with your model path)
yolo export model=path/to/your/best.pt format=onnx opset=11

# This creates a 'best.onnx' file in the same directory
```

### Method 2: Using Python Script

```python
from ultralytics import YOLO

# Load your model
model = YOLO('path/to/your/best.pt')

# Export to ONNX
model.export(format='onnx', opset=11)
```

### Method 3: Manual PyTorch Export

```python
import torch
import torchvision

# Load your model
model = torch.load('path/to/your/best.pt', map_location='cpu')

# Export to ONNX
torch.onnx.export(
    model,
    torch.randn(1, 3, 640, 640),  # Sample input
    'best.onnx',
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output']
)
```

## Step 2: Place Your Model File

1. **Create models directory** in your public folder:
   ```
   kriti-hire-forge/
   ├── public/
   │   └── models/          ← Create this folder
   │       └── best.onnx    ← Put your converted model here
   ```

2. **Copy your converted model**:
   ```bash
   # Copy your converted ONNX model to the public directory
   cp best.onnx public/models/best.onnx
   ```

## Step 3: Update Model Configuration

Open `src/lib/yoloBodyLanguage.ts` and update the configuration:

### 🔥 REQUIRED CHANGES:

1. **Model Path** (Line ~38):
   ```typescript
   modelPath: '/models/best.onnx', // ✅ This should work if you followed Step 2
   ```

2. **Input Dimensions** (Lines ~41-42):
   ```typescript
   // Update these based on your model's input size
   inputWidth: 640,   // ← Change if your model uses different size
   inputHeight: 640,  // ← Change if your model uses different size
   ```

3. **Class Names** (Lines ~48-62):
   ```typescript
   // 🔥 MOST IMPORTANT: Update with your model's actual classes
   classNames: [
     'person',           // ← Replace with your actual class names
     'good_posture',     // ← What body language classes does your model detect?
     'bad_posture',      // ← Update based on your training data
     'eye_contact',      // ← What did you train your model to recognize?
     'looking_away',     // ← Add all the classes from your model
     // ... add more classes as needed
   ],
   ```

## Step 4: Test Your Model

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the Interview page**: http://localhost:8080/student/dashboard → Interview tab

3. **Check the browser console** for model loading messages:
   - ✅ "YOLO model loaded successfully!" 
   - ❌ "Failed to load YOLO model" → Check the troubleshooting section

## Step 5: Customize Analysis Logic

Update the body language analysis in `src/lib/yoloBodyLanguage.ts`:

### Update `analyzeBodyLanguage()` method (Line ~200+):

```typescript
private analyzeBodyLanguage(predictions: YOLOPrediction[]): BodyLanguageAnalysis {
  // 🔥 Customize this based on what your model detects
  
  // Example: If your model detects 'good_eye_contact' class
  const goodEyeContact = predictions.find(p => p.class === 'good_eye_contact');
  if (goodEyeContact && goodEyeContact.confidence > 0.7) {
    analysis.eyeContact.isLookingAtCamera = true;
    analysis.eyeContact.confidence = goodEyeContact.confidence;
  }
  
  // Example: If your model detects 'slouching' class
  const slouching = predictions.find(p => p.class === 'slouching');
  if (slouching && slouching.confidence > 0.6) {
    analysis.posture.score = 30;
    analysis.posture.issues.push('Slouching detected');
  }
  
  // Add more logic based on your model's classes...
}
```

## Troubleshooting

### ❌ "Failed to load YOLO model"

1. **Check file path**: Make sure `best.onnx` is in `public/models/`
2. **Check console**: Look for detailed error messages
3. **Check model format**: Ensure ONNX conversion was successful
4. **Check file size**: Large models (>50MB) might take time to load

### ❌ "Model loaded but no predictions"

1. **Check class names**: Make sure they match your training data
2. **Check confidence threshold**: Lower it in the config (line ~46)
3. **Check input preprocessing**: Verify image format matches training

### ❌ Performance Issues

1. **Reduce analysis frequency**: Increase `videoAnalysisInterval` in config
2. **Optimize model**: Use smaller input size or quantized model
3. **Use Web Workers**: For better performance (advanced)

## Model Information

To see what your model expects, check the browser console after loading:

```
Model input names: ['input']
Model output names: ['output']  
Model input shape: [1, 3, 640, 640]
Model output shape: [1, 25200, 85]  ← This tells you the output format
```

Use this information to update the `postprocessOutput()` method if needed.

## Example Model Classes

Common body language classes you might have trained:

```typescript
classNames: [
  // Basic detection
  'person',
  'face',
  
  // Eye contact
  'eye_contact',
  'looking_away',
  'looking_left',
  'looking_right',
  'looking_down',
  
  // Posture
  'sitting_straight',
  'slouching',
  'leaning_forward',
  'leaning_back',
  
  // Engagement
  'engaged',
  'distracted',
  'confident',
  'nervous',
  
  // Hand gestures
  'hands_visible',
  'gesturing',
  'fidgeting'
]
```

## Next Steps

1. ✅ Convert your .pt model to ONNX
2. ✅ Place it in `public/models/best.onnx`
3. ✅ Update class names in the config
4. ✅ Test the model loading
5. ✅ Customize the analysis logic
6. ✅ Fine-tune confidence thresholds

Your YOLO model is now ready to analyze body language in real-time! 🚀