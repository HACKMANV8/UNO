import { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Play, 
  Square, 
  BarChart3, 
  Eye, 
  Volume2, 
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Download,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  InterviewAnalysisController, 
  AnalysisEvent, 
  InterviewAnalysis 
} from '@/lib/interviewAnalysis';
import { config, validateConfig } from '@/config/interview';

type InterviewState = 'setup' | 'recording' | 'completed';

export default function StudentInterviewSimulationPage() {
  // State management
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [role, setRole] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [transcript, setTranscript] = useState('');
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AnalysisEvent | null>(null);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisControllerRef = useRef<InterviewAnalysisController | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera and microphone
  useEffect(() => {
    // Validate configuration
    const validation = validateConfig();
    setConfigErrors(validation.errors);
    
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  // Ensure video stream is maintained during state changes
  useEffect(() => {
    console.log('🔄 State changed to:', interviewState);
    if (streamRef.current && videoRef.current) {
      if (!videoRef.current.srcObject) {
        console.log('� Reconnecting video stream during state change');
        videoRef.current.srcObject = streamRef.current;
      } else {
        console.log('✅ Video stream already connected');
      }

      // Ensure video is visible and playing during recording
      if (interviewState === 'recording' && videoRef.current.paused) {
        videoRef.current.play().catch(error => {
          console.warn('⚠️ Could not play video during recording:', error);
        });
      }
    } else {
      console.warn('❌ Missing stream or video ref during state change:', {
        hasStream: !!streamRef.current,
        hasVideoRef: !!videoRef.current
      });
    }
  }, [interviewState]);

  const initializeMedia = async () => {
    try {
      console.log('📷 Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: config.recording.videoConstraints,
        audio: config.recording.audioConstraints
      });
      
      console.log('✅ Media stream obtained:', stream);
      streamRef.current = stream;
      
      // Wait for video element to be ready and set stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to start playing
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('📹 Video metadata loaded, dimensions:', 
                videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              resolve();
            };
          }
        });
      }

      console.log('🤖 Initializing analysis controller...');
      // Initialize analysis controller with API key from config
      analysisControllerRef.current = new InterviewAnalysisController(
        videoRef.current!,
        config.geminiApiKey,
        (text) => {
          console.log('🎤 Transcript update:', text);
          setTranscript(text);
        },
        (event) => {
          console.log('🎯 Analysis event:', event);
          setEvents(prev => [...prev, event]);
        }
      );

      console.log('✅ Media initialization complete');

    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      // Show user-friendly error
      setConfigErrors(prev => [...prev, `Camera/Microphone access denied: ${error.message}`]);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startInterview = async () => {
    if (!role.trim()) return;

    try {
      console.log('🎬 Starting interview...');
      setInterviewState('recording');
      setRecordingDuration(0);
      setEvents([]);
      setTranscript('');

      // Start video recording
      if (streamRef.current) {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start();
        console.log('📹 Video recording started');
      }

      // Ensure video is playing
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          console.log('▶️ Video element playing');
        } catch (error) {
          console.warn('⚠️ Video play error:', error);
        }
      }

      // Start analysis
      await analysisControllerRef.current?.startAnalysis();
      console.log('🤖 Analysis started');

      // Generate first question
      console.log('❓ Generating first question...');
      try {
        const question = await analysisControllerRef.current?.generateQuestion(role);
        const finalQuestion = question || `Tell me about yourself and why you're interested in this ${role} position.`;
        setCurrentQuestion(finalQuestion);
        console.log('✅ Question generated:', finalQuestion);
      } catch (error) {
        console.log('⚠️ Using fallback question due to API error');
        const fallbackQuestion = `Tell me about yourself and why you're interested in this ${role} position.`;
        setCurrentQuestion(fallbackQuestion);
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('✅ Interview started successfully!');
    } catch (error) {
      console.error('❌ Error starting interview:', error);
      // Reset state on error
      setInterviewState('setup');
    }
  };

  const stopInterview = async () => {
    console.log('🛑 Stopping interview...');
    setInterviewState('completed');

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('📹 Stopping video recording...');
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = () => {
        console.log('📼 Video recording stopped, creating blob...');
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        if (recordedVideoRef.current) {
          recordedVideoRef.current.src = url;
        }
        console.log('✅ Video ready for playback');
      };
    }

    // Stop analysis
    console.log('🤖 Stopping analysis...');
    analysisControllerRef.current?.stopAnalysis();
    
    // Get final analysis
    console.log('📊 Getting final analysis...');
    const finalAnalysis = analysisControllerRef.current?.getCompleteAnalysis();
    if (finalAnalysis) {
      setAnalysis(finalAnalysis);
      console.log('✅ Analysis complete:', finalAnalysis);
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    console.log('✅ Interview stopped successfully!');
  };

  const restartInterview = () => {
    setInterviewState('setup');
    setRole('');
    setCurrentQuestion('');
    setUserAnswer('');
    setTranscript('');
    setEvents([]);
    setAnalysis(null);
    setRecordingDuration(0);
    setSelectedEvent(null);
    analysisControllerRef.current?.reset();
    recordedChunksRef.current = [];
  };

  const jumpToEvent = (event: AnalysisEvent) => {
    setSelectedEvent(event);
    if (recordedVideoRef.current) {
      recordedVideoRef.current.currentTime = event.timestamp / 1000;
    }
  };

  const downloadReport = () => {
    if (!analysis) return;

    const report = {
      timestamp: new Date().toISOString(),
      role: role,
      duration: recordingDuration,
      scores: {
        visual: analysis.visualScore,
        vocal: analysis.vocalScore,
        linguistic: analysis.linguisticScore,
        overall: analysis.overallScore
      },
      summary: analysis.summary,
      events: analysis.events
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Setup Phase
  if (interviewState === 'setup') {
    return (
      <div className="space-y-8">
        <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Interview Simulator</h1>
              <p className="text-muted-foreground">
                Realistic interview practice with real-time feedback
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Panel */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Position/Role</label>
                <Input
                  placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              {configErrors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <strong>Configuration Required:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {configErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  The AI will analyze your <strong>body language</strong>, <strong>voice patterns</strong>, 
                  and <strong>answer quality</strong> in real-time. You'll get detailed feedback with 
                  video playback.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={startInterview} 
                disabled={!role.trim() || configErrors.length > 0}
                className="w-full"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            </CardContent>
          </Card>

          {/* Camera Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Camera Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-white/50" />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVideo}
                  className="flex-1"
                >
                  {isVideoEnabled ? (
                    <><Video className="h-4 w-4 mr-2" /> Video On</>
                  ) : (
                    <><VideoOff className="h-4 w-4 mr-2" /> Video Off</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                  className="flex-1"
                >
                  {isAudioEnabled ? (
                    <><Mic className="h-4 w-4 mr-2" /> Mic On</>
                  ) : (
                    <><MicOff className="h-4 w-4 mr-2" /> Mic Off</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Recording Phase
  if (interviewState === 'recording') {
    return (
      <div className="space-y-6">
        {/* Header with Timer */}
        <div className="glass-card p-4 rounded-2xl border-red-200 bg-red-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">Recording Interview</span>
              <Badge variant="secondary">{formatTime(recordingDuration)}</Badge>
              <Badge variant="outline" className="text-xs">State: {interviewState}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={stopInterview} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop Interview
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔄 Current state:', interviewState);
                  console.log('🔄 Forcing stop...');
                  stopInterview();
                }} 
                variant="outline" 
                size="sm"
              >
                Force Stop
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Interview Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-80 object-cover"
                  />
                </div>
                
                {currentQuestion && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-medium text-primary mb-2">Current Question:</p>
                    <p>{currentQuestion}</p>
                  </div>
                )}

                {transcript && (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                    <p className="font-medium mb-2">Live Transcript:</p>
                    <p className="text-sm text-muted-foreground">{transcript}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Feedback */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Live Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Speaking Pace</span>
                  <Badge variant="outline">Normal</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Eye Contact</span>
                  <Badge variant="outline">Good</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Posture</span>
                  <Badge variant="outline">Excellent</Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Recent Events</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events.slice(-5).map((event, index) => (
                    <div key={index} className={`p-2 rounded-md text-xs ${getSeverityColor(event.severity)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatTime(Math.floor(event.timestamp / 1000))}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Phase
  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interview Complete!</h1>
            <p className="text-muted-foreground">
              Review your performance and detailed feedback
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={downloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={restartInterview}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Interview
            </Button>
          </div>
        </div>
      </div>

      {analysis && (
        <Tabs defaultValue="scores" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="playback">Video Playback</TabsTrigger>
            <TabsTrigger value="events">Timeline</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(analysis.overallScore)}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-2xl font-bold">{Math.round(analysis.visualScore)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Visual</div>
                  <Progress value={analysis.visualScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Volume2 className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-2xl font-bold">{Math.round(analysis.vocalScore)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Vocal</div>
                  <Progress value={analysis.vocalScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-2xl font-bold">{Math.round(analysis.linguisticScore)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Content</div>
                  <Progress value={analysis.linguisticScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Interview Duration</span>
                    <Badge variant="outline">{formatTime(recordingDuration)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Filler Words</span>
                    <Badge variant="outline">{analysis.summary.totalFillerWords}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Speaking Pace</span>
                    <Badge variant="outline">{Math.round(analysis.summary.averageSpeakingPace)} WPM</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Eye Contact</span>
                    <Badge variant="outline">{Math.round(analysis.summary.eyeContactPercentage)}%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.overallScore >= 80 && (
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <p className="text-sm">Excellent performance! You demonstrated strong interview skills.</p>
                      </div>
                    )}
                    {analysis.summary.totalFillerWords > 10 && (
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <p className="text-sm">Try to reduce filler words for more confident delivery.</p>
                      </div>
                    )}
                    {analysis.summary.eyeContactPercentage < 70 && (
                      <div className="flex items-start space-x-2">
                        <Eye className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">Focus on maintaining better eye contact with the camera.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playback" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Interview Playback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    ref={recordedVideoRef}
                    controls
                    className="w-full h-96 object-cover"
                  />
                </div>
                {selectedEvent && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getSeverityColor(selectedEvent.severity)}>
                        {selectedEvent.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(Math.floor(selectedEvent.timestamp / 1000))}
                      </span>
                    </div>
                    <p className="text-sm">{selectedEvent.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.events.map((event, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedEvent === event ? 'ring-2 ring-primary' : ''
                      } ${getSeverityColor(event.severity)}`}
                      onClick={() => jumpToEvent(event)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs font-mono">
                          {formatTime(Math.floor(event.timestamp / 1000))}
                        </span>
                      </div>
                      <p className="text-sm">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.vocalScore > 75 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Clear and confident speaking voice</span>
                      </li>
                    )}
                    {analysis.visualScore > 75 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Good body language and posture</span>
                      </li>
                    )}
                    {analysis.summary.averageSpeakingPace >= 120 && analysis.summary.averageSpeakingPace <= 160 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Optimal speaking pace</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.summary.totalFillerWords > 5 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Reduce use of filler words</span>
                      </li>
                    )}
                    {analysis.summary.eyeContactPercentage < 70 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Maintain better eye contact</span>
                      </li>
                    )}
                    {analysis.summary.averageSpeakingPace < 120 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Increase speaking pace slightly</span>
                      </li>
                    )}
                    {analysis.summary.averageSpeakingPace > 160 && (
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Slow down speaking pace</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h4>Practice Tips:</h4>
                  <ul>
                    <li>Practice answering common interview questions out loud</li>
                    <li>Record yourself regularly to track improvement</li>
                    <li>Focus on maintaining eye contact with the camera</li>
                    <li>Use pauses instead of filler words to gather your thoughts</li>
                    <li>Sit up straight and maintain confident body language</li>
                  </ul>
                  
                  <h4>Next Steps:</h4>
                  <ul>
                    <li>Schedule another practice session in a few days</li>
                    <li>Work on specific areas highlighted in this analysis</li>
                    <li>Practice with different types of interview questions</li>
                    <li>Consider doing mock interviews with peers or mentors</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}