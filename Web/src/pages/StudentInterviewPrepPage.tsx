import { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { callInterviewAI } from '@/services/api';

export default function StudentInterviewPrepPage() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<{ questions: string[]; tips: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    try {
      const data = await callInterviewAI(topic);
      setResult(data);
    } catch (error) {
      console.error('Failed to generate interview prep:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Interview Prep</h1>
            <p className="text-muted-foreground">
              Practice with AI-generated interview questions
            </p>
          </div>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Generate Interview Questions</CardTitle>
          <CardDescription>
            Enter a topic or role to get personalized interview questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="e.g., Full Stack Development, Data Science, Product Management"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              variant="premium"
              onClick={handleGenerate}
              disabled={isLoading || !topic}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Practice Questions</CardTitle>
              <CardDescription>
                Common interview questions for {topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {result.questions.map((question, index) => (
                  <li key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-sm">{question}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Interview Tips</CardTitle>
              <CardDescription>
                Best practices for your interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
