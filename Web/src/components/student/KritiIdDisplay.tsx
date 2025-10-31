import { Copy, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function KritiIdDisplay() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.kritiId) {
      navigator.clipboard.writeText(user.kritiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user?.kritiId) return null;

  return (
    <Card className="glass-card border-accent/30 glow-accent">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Kriti ID</h3>
            <div className="flex items-center justify-between">
              <code className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">
                {user.kritiId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="ml-2"
              >
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this ID with recruiters to verify your credentials instantly
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
