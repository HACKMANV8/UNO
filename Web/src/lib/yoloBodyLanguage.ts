// YOLO Model Integration for Body Language Analysis
import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime for web
ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';

export interface YOLOPrediction {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  keypoints?: Array<{
    x: number;
    y: number;
    confidence: number;
    name: string;
  }>;
}

export interface EmotionAnalysis {
  emotions: {
    detected: string[];
    dominant: string;
    confidence: number;
    distribution: Record<string, number>;
  };
  interview_suitability: {
    score: number;
    positive_emotions: string[];
    concerning_emotions: string[];
    recommendations: string[];
  };
  engagement: {
    score: number;
    factors: string[];
  };
  confidence: {
    level: 'low' | 'moderate' | 'high';
    score: number;
    indicators: string[];
  };
}

export class YOLOEmotionAnalyzer {
  private model: ort.InferenceSession | null = null;
  private modelLoaded = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Model configuration
  private readonly MODEL_CONFIG = {
    // 🔥 PUT YOUR MODEL PATH HERE 🔥
    modelPath: '/models/best.onnx', // ← Change this to your converted model path
    
    // Model input dimensions (adjust based on your model)
    inputWidth: 640,
    inputHeight: 640,
    
    // Confidence thresholds
    confidenceThreshold: 0.5,
    nmsThreshold: 0.4,
    
    // Class names from your emotion detection model
    // Based on your YAML configuration
    classNames: [
      'Anger',
      'Contempt', 
      'Disgust',
      'Fear',
      'Happy',
      'Neutral',
      'Sad',
      'Surprise'
    ],
    
    // Keypoint names (if your model includes pose estimation)
    keypointNames: [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ]
  };

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Load your converted YOLO model
   * 🔥 IMPORTANT: Convert your .pt model to .onnx first! 🔥
   * 
   * To convert your model:
   * 1. Install ultralytics: pip install ultralytics
   * 2. Convert: yolo export model=best.pt format=onnx
   * 3. Place the .onnx file in public/models/best.onnx
   */
  async loadModel(): Promise<boolean> {
    try {
      console.log('🤖 Loading YOLO model for body language analysis...');
      
      // 🔥 This loads your converted ONNX model 🔥
      this.model = await ort.InferenceSession.create(this.MODEL_CONFIG.modelPath, {
        executionProviders: ['wasm'], // Use WebAssembly for performance
        graphOptimizationLevel: 'all',
      });
      
      this.modelLoaded = true;
      console.log('✅ YOLO model loaded successfully!');
      console.log('Model input names:', this.model.inputNames);
      console.log('Model output names:', this.model.outputNames);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load YOLO model:', error);
      console.log('💡 Make sure you have:');
      console.log('1. Converted your .pt model to .onnx format');
      console.log('2. Placed it in public/models/best.onnx');
      console.log('3. Updated the modelPath in MODEL_CONFIG');
      
      this.modelLoaded = false;
      return false;
    }
  }

  /**
   * Preprocess image for YOLO model input
   */
  private preprocessImage(imageData: ImageData): ort.Tensor {
    const { width, height, data } = imageData;
    const { inputWidth, inputHeight } = this.MODEL_CONFIG;
    
    // Resize canvas for model input
    this.canvas.width = inputWidth;
    this.canvas.height = inputHeight;
    
    // Create ImageData object and draw it
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const tempImageData = new ImageData(data, width, height);
    tempCtx.putImageData(tempImageData, 0, 0);
    
    // Resize to model input size
    this.ctx.drawImage(tempCanvas, 0, 0, inputWidth, inputHeight);
    const resizedImageData = this.ctx.getImageData(0, 0, inputWidth, inputHeight);
    
    // Convert to tensor format [1, 3, height, width] - RGB normalized to 0-1
    const tensorData = new Float32Array(1 * 3 * inputHeight * inputWidth);
    const pixels = resizedImageData.data;
    
    for (let i = 0; i < inputHeight * inputWidth; i++) {
      const pixelIndex = i * 4;
      // Normalize to 0-1 and convert to CHW format
      tensorData[i] = pixels[pixelIndex] / 255; // R
      tensorData[inputHeight * inputWidth + i] = pixels[pixelIndex + 1] / 255; // G
      tensorData[inputHeight * inputWidth * 2 + i] = pixels[pixelIndex + 2] / 255; // B
    }
    
    return new ort.Tensor('float32', tensorData, [1, 3, inputHeight, inputWidth]);
  }

  /**
   * Post-process YOLO model output
   */
  private postprocessOutput(output: ort.Tensor): YOLOPrediction[] {
    const predictions: YOLOPrediction[] = [];
    const outputData = output.data as Float32Array;
    const { confidenceThreshold, classNames } = this.MODEL_CONFIG;
    
    // 🔥 ADJUST THIS BASED ON YOUR MODEL'S OUTPUT FORMAT 🔥
    // Common YOLO output format: [batch, num_detections, 85] where 85 = 4(bbox) + 1(conf) + 80(classes)
    // Your model might be different - check your model's output shape!
    
    const numDetections = output.dims[1] || 0;
    const numClasses = classNames.length;
    const outputSize = output.dims[2] || 0; // Should be 4 + 1 + numClasses
    
    for (let i = 0; i < numDetections; i++) {
      const baseIndex = i * outputSize;
      
      // Extract bbox coordinates (usually first 4 values)
      const x = outputData[baseIndex];
      const y = outputData[baseIndex + 1];
      const width = outputData[baseIndex + 2];
      const height = outputData[baseIndex + 3];
      
      // Extract confidence (usually 5th value)
      const confidence = outputData[baseIndex + 4];
      
      if (confidence > confidenceThreshold) {
        // Find class with highest probability
        let maxClassProb = 0;
        let maxClassIndex = 0;
        
        for (let j = 0; j < numClasses; j++) {
          const classProb = outputData[baseIndex + 5 + j];
          if (classProb > maxClassProb) {
            maxClassProb = classProb;
            maxClassIndex = j;
          }
        }
        
        const finalConfidence = confidence * maxClassProb;
        
        if (finalConfidence > confidenceThreshold) {
          predictions.push({
            class: classNames[maxClassIndex] || `class_${maxClassIndex}`,
            confidence: finalConfidence,
            bbox: {
              x: x - width / 2,
              y: y - height / 2,
              width,
              height
            }
          });
        }
      }
    }
    
    return predictions;
  }

  /**
   * Analyze emotions from predictions for interview suitability
   */
  private analyzeEmotions(predictions: YOLOPrediction[]): EmotionAnalysis {
    const analysis: EmotionAnalysis = {
      emotions: {
        detected: [],
        dominant: 'Neutral',
        confidence: 0,
        distribution: {}
      },
      interview_suitability: {
        score: 50,
        positive_emotions: [],
        concerning_emotions: [],
        recommendations: []
      },
      engagement: {
        score: 50,
        factors: []
      },
      confidence: {
        level: 'moderate',
        score: 50,
        indicators: []
      }
    };

    // Process emotion predictions
    if (predictions.length === 0) {
      analysis.emotions.dominant = 'Neutral';
      analysis.emotions.confidence = 0;
      return analysis;
    }

    // Find dominant emotion and build distribution
    let dominantEmotion = predictions[0];
    const emotionDistribution: Record<string, number> = {};
    const detectedEmotions: string[] = [];

    predictions.forEach(prediction => {
      if (prediction.confidence > dominantEmotion.confidence) {
        dominantEmotion = prediction;
      }
      
      emotionDistribution[prediction.class] = prediction.confidence;
      if (prediction.confidence > 0.3) { // Only include confident detections
        detectedEmotions.push(prediction.class);
      }
    });

    analysis.emotions.dominant = dominantEmotion.class;
    analysis.emotions.confidence = dominantEmotion.confidence;
    analysis.emotions.detected = detectedEmotions;
    analysis.emotions.distribution = emotionDistribution;

    // Analyze interview suitability based on emotions
    this.analyzeInterviewSuitability(analysis, emotionDistribution);
    
    // Analyze confidence level
    this.analyzeConfidenceLevel(analysis, emotionDistribution);
    
    // Calculate engagement score
    this.calculateEngagementScore(analysis, emotionDistribution);

    return analysis;
  }

  private analyzeInterviewSuitability(analysis: EmotionAnalysis, emotions: Record<string, number>) {
    let suitabilityScore = 50;
    
    // Positive emotions for interviews
    const positiveEmotions = ['Happy', 'Neutral'];
    const concerningEmotions = ['Anger', 'Contempt', 'Disgust', 'Fear', 'Sad'];
    
    positiveEmotions.forEach(emotion => {
      if (emotions[emotion] && emotions[emotion] > 0.4) {
        analysis.interview_suitability.positive_emotions.push(emotion);
        suitabilityScore += emotions[emotion] * 30;
        
        if (emotion === 'Happy') {
          analysis.engagement.factors.push('Showing positive enthusiasm');
        } else if (emotion === 'Neutral') {
          analysis.engagement.factors.push('Maintaining professional composure');
        }
      }
    });

    concerningEmotions.forEach(emotion => {
      if (emotions[emotion] && emotions[emotion] > 0.3) {
        analysis.interview_suitability.concerning_emotions.push(emotion);
        suitabilityScore -= emotions[emotion] * 40;
        
        // Add specific recommendations
        switch (emotion) {
          case 'Anger':
            analysis.interview_suitability.recommendations.push('Take a deep breath and try to remain calm');
            break;
          case 'Fear':
            analysis.interview_suitability.recommendations.push('Remember to breathe and speak slowly');
            break;
          case 'Sad':
            analysis.interview_suitability.recommendations.push('Try to project more energy and enthusiasm');
            break;
          case 'Contempt':
          case 'Disgust':
            analysis.interview_suitability.recommendations.push('Check your facial expressions - maintain neutrality');
            break;
        }
      }
    });

    // Handle surprise separately (can be positive or negative depending on context)
    if (emotions['Surprise'] && emotions['Surprise'] > 0.4) {
      if (emotions['Surprise'] > 0.7) {
        analysis.interview_suitability.concerning_emotions.push('Surprise');
        analysis.interview_suitability.recommendations.push('Try to appear more prepared and composed');
        suitabilityScore -= 10;
      } else {
        analysis.engagement.factors.push('Showing appropriate reactions');
        suitabilityScore += 5;
      }
    }

    analysis.interview_suitability.score = Math.max(0, Math.min(100, suitabilityScore));
  }

  private analyzeConfidenceLevel(analysis: EmotionAnalysis, emotions: Record<string, number>) {
    let confidenceScore = 50;
    
    // Indicators of confidence
    if (emotions['Happy'] && emotions['Happy'] > 0.4) {
      confidenceScore += 20;
      analysis.confidence.indicators.push('Positive facial expression');
    }
    
    if (emotions['Neutral'] && emotions['Neutral'] > 0.5) {
      confidenceScore += 15;
      analysis.confidence.indicators.push('Composed and professional demeanor');
    }
    
    // Indicators of low confidence
    if (emotions['Fear'] && emotions['Fear'] > 0.3) {
      confidenceScore -= 25;
      analysis.confidence.indicators.push('Signs of nervousness detected');
    }
    
    if (emotions['Sad'] && emotions['Sad'] > 0.3) {
      confidenceScore -= 20;
      analysis.confidence.indicators.push('Low energy detected');
    }

    analysis.confidence.score = Math.max(0, Math.min(100, confidenceScore));
    
    if (analysis.confidence.score >= 70) {
      analysis.confidence.level = 'high';
    } else if (analysis.confidence.score >= 40) {
      analysis.confidence.level = 'moderate';
    } else {
      analysis.confidence.level = 'low';
    }
  }

  private calculateEngagementScore(analysis: EmotionAnalysis, emotions: Record<string, number>) {
    let engagementScore = 50;
    
    // High engagement indicators
    if (emotions['Happy'] && emotions['Happy'] > 0.3) {
      engagementScore += emotions['Happy'] * 25;
      analysis.engagement.factors.push('Showing enthusiasm');
    }
    
    if (emotions['Surprise'] && emotions['Surprise'] > 0.2 && emotions['Surprise'] < 0.6) {
      engagementScore += 10;
      analysis.engagement.factors.push('Showing interest and attention');
    }
    
    // Low engagement indicators
    if (emotions['Sad'] && emotions['Sad'] > 0.4) {
      engagementScore -= emotions['Sad'] * 30;
    }
    
    if (emotions['Contempt'] && emotions['Contempt'] > 0.3) {
      engagementScore -= emotions['Contempt'] * 35;
    }
    
    // Neutral can be good if consistent
    if (emotions['Neutral'] && emotions['Neutral'] > 0.6) {
      engagementScore += 10;
      analysis.engagement.factors.push('Maintaining professional composure');
    }

    analysis.engagement.score = Math.max(0, Math.min(100, engagementScore));
  }

  /**
   * Run inference on image data
   */
  async analyzeFrame(imageData: ImageData): Promise<EmotionAnalysis | null> {
    if (!this.modelLoaded || !this.model) {
      console.warn('Model not loaded. Call loadModel() first.');
      return null;
    }

    try {
      // Preprocess image
      const inputTensor = this.preprocessImage(imageData);
      
      // Run inference
      const feeds: Record<string, ort.Tensor> = {};
      feeds[this.model.inputNames[0]] = inputTensor;
      
      const results = await this.model.run(feeds);
      const outputTensor = results[this.model.outputNames[0]];
      
      // Post-process results
      const predictions = this.postprocessOutput(outputTensor);
      
      // Analyze emotions
      const analysis = this.analyzeEmotions(predictions);
      
      return analysis;
      
    } catch (error) {
      console.error('Error during inference:', error);
      return null;
    }
  }

  /**
   * Check if model is loaded and ready
   */
  isReady(): boolean {
    return this.modelLoaded && this.model !== null;
  }

  /**
   * Get model configuration info
   */
  getModelInfo() {
    return {
      ...this.MODEL_CONFIG,
      isLoaded: this.modelLoaded,
      inputNames: this.model?.inputNames || [],
      outputNames: this.model?.outputNames || []
    };
  }

  /**
   * Dispose of the model and free memory
   */
  dispose() {
    if (this.model) {
      this.model = null;
      this.modelLoaded = false;
    }
  }
}