import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, GraduationCap, ArrowLeft, Shield } from 'lucide-react';

export default function SignupSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Join Kriti HireForge</h1>
          <p className="text-muted-foreground text-lg">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Student/Job Seeker Card */}
          <Card className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Student / Job Seeker</CardTitle>
              <CardDescription className="text-center">
                Build your professional profile, create resumes, and showcase your credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-grow">
                <li>• Create professional resumes</li>
                <li>• Showcase verified credentials</li>
                <li>• AI-powered interview preparation</li>
                <li>• Career guidance and tips</li>
              </ul>
              <Button 
                variant="premium" 
                className="w-full mt-auto" 
                onClick={() => navigate('/signup/firebase-student')}
              >
                Sign up as Student
              </Button>
            </CardContent>
          </Card>

          {/* Recruiter Card */}
          <Card className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Recruiter</CardTitle>
              <CardDescription className="text-center">
                Find and verify qualified candidates with authentic credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-grow">
                <li>• Verify candidate credentials</li>
                <li>• Access verified talent pool</li>
                <li>• Advanced search filters</li>
                <li>• Streamlined hiring process</li>
              </ul>
              <Button 
                variant="premium" 
                className="w-full mt-auto" 
                onClick={() => navigate('/signup/firebase-recruiter')}
              >
                Sign up as Recruiter
              </Button>
            </CardContent>
          </Card>

          {/* Issuer Card */}
          <Card className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Issuer</CardTitle>
              <CardDescription className="text-center">
                Issue and manage verified credentials for your institution or organization
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-grow">
                <li>• Issue verified credentials</li>
                <li>• Manage credential templates</li>
                <li>• Track issued certificates</li>
                <li>• Institutional branding</li>
              </ul>
              <Button 
                variant="premium" 
                className="w-full mt-auto" 
                onClick={() => navigate('/signup/firebase-issuer')}
              >
                Sign up as Issuer
              </Button>
            </CardContent>
          </Card>

         
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto">
              Login here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}