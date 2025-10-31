import { useEffect, useState } from 'react';
import { Briefcase, Award, Sparkles } from 'lucide-react';
import { fetchCredentials } from '@/services/api';
import { VerifiableCredential } from '@/lib/crypto';
import { useAuth } from '@/hooks/useAuth';
import { CredentialCard } from '@/components/credentials/CredentialCard';
import { KritiIdDisplay } from '@/components/student/KritiIdDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { Link } from 'react-router-dom';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCredentials = async () => {
      if (user) {
        try {
          const data = await fetchCredentials(user.id);
          setCredentials(data);
        } catch (error) {
          console.error('Failed to load credentials:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCredentials();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your verified credentials and career profile
        </p>
      </div>

      {/* Kriti ID Card */}
      <KritiIdDisplay />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/student/resume" className="block">
          <Card className="glass-card hover:border-primary/40 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resume Builder</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI-Powered</div>
              <p className="text-xs text-muted-foreground mt-1">
                Create professional resumes instantly
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/student/ai-coach" className="block">
          <Card className="glass-card hover:border-primary/40 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Coach</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Interview Prep</div>
              <p className="text-xs text-muted-foreground mt-1">
                Practice with personalized questions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="glass-card bg-accent/10 border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Credentials</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{credentials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified credentials earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credentials Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Credentials</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : credentials.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No credentials yet</h3>
              <p className="text-muted-foreground mb-4">
                Start earning verified credentials from institutions
              </p>
              <Button variant="premium">Explore Opportunities</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {credentials.map((credential, index) => (
              <CredentialCard key={index} credential={credential} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
