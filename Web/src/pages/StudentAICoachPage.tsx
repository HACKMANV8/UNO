import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Target, 
  Clock,
  CheckCircle,
  PlayCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const INTERVIEW_CATEGORIES = [
  { id: 'technical', label: 'Technical', icon: Brain, description: 'Programming, algorithms, system design' },
  { id: 'behavioral', label: 'Behavioral', icon: MessageSquare, description: 'Leadership, teamwork, problem-solving' },
  { id: 'situational', label: 'Situational', icon: Target, description: 'Real-world scenarios and case studies' },
];

const MOCK_QUESTIONS = {
  technical: [
    "Explain the difference between SQL and NoSQL databases.",
    "How would you optimize a slow-performing web application?",
    "Describe the concept of REST APIs and their principles.",
    "What is the time complexity of quicksort algorithm?",
  ],
  behavioral: [
    "Tell me about a time you had to work with a difficult team member.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle constructive criticism?",
    "Tell me about your greatest professional achievement.",
  ],
  situational: [
    "You discover a security vulnerability in production. What do you do?",
    "Your project is behind schedule. How do you get back on track?",
    "A client wants to change requirements mid-project. How do you handle it?",
    "You disagree with your manager's technical decision. What's your approach?",
  ],
};

export default function StudentAICoachPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    averageScore: 0,
    totalTime: 0,
  });

  const startPractice = (category: string) => {
    setSelectedCategory(category);
    const questions = MOCK_QUESTIONS[category as keyof typeof MOCK_QUESTIONS];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setUserAnswer('');
    setFeedback('');
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockFeedback = `
**Strengths:**
• Clear communication and structured approach
• Good understanding of core concepts
• Relevant examples provided

**Areas for Improvement:**
• Could elaborate more on specific technical details
• Consider mentioning industry best practices
• Add quantifiable results where possible

**Score: 7.5/10**

**Suggestion:** Try to be more specific about the tools and methodologies you would use. Recruiters appreciate concrete examples and measurable outcomes.
    `;
    
    setFeedback(mockFeedback);
    setSessionStats(prev => ({
      questionsAnswered: prev.questionsAnswered + 1,
      averageScore: Math.round((prev.averageScore + 7.5) / 2 * 10) / 10,
      totalTime: prev.totalTime + Math.floor(Math.random() * 300) + 120, // 2-7 minutes
    }));
    setIsAnalyzing(false);
  };

  const nextQuestion = () => {
    const questions = MOCK_QUESTIONS[selectedCategory as keyof typeof MOCK_QUESTIONS];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setUserAnswer('');
    setFeedback('');
  };

  const resetSession = () => {
    setSelectedCategory('');
    setCurrentQuestion('');
    setUserAnswer('');
    setFeedback('');
    setSessionStats({ questionsAnswered: 0, averageScore: 0, totalTime: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Interview Coach</h1>
        <Badge variant="secondary">Beta</Badge>
      </div>

      {/* Session Stats */}
      {sessionStats.questionsAnswered > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{sessionStats.questionsAnswered}</span>
              </div>
              <p className="text-xs text-muted-foreground">Questions Answered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{sessionStats.averageScore}/10</span>
              </div>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{Math.floor(sessionStats.totalTime / 60)}m</span>
              </div>
              <p className="text-xs text-muted-foreground">Practice Time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedCategory ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Interview Category</CardTitle>
              <CardDescription>
                Select the type of interview questions you want to practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INTERVIEW_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card 
                      key={category.id} 
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => startPractice(category.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold">{category.label}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>AI-Powered Feedback:</strong> Get personalized feedback on your answers including strengths, areas for improvement, and scoring based on industry standards.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="capitalize">
                {selectedCategory} Questions
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Session
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Interview Question</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg mb-4">
                <p className="text-lg font-medium">{currentQuestion}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Answer</label>
                  <Textarea
                    placeholder="Type your answer here... Take your time to think through your response."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={6}
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!userAnswer.trim() || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        Analyzing Answer...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                  {feedback && (
                    <Button variant="outline" onClick={nextQuestion}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{feedback}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}