import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Shield, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import logoImage from '@/assets/kriti-logo.png';

interface AuthorizationStatusPageProps {
  userEmail?: string;
  userRole?: string;
}

export default function AuthorizationStatusPage({ userEmail, userRole }: AuthorizationStatusPageProps) {
  const { user, logout } = useAuth();
  const { pendingUsers } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get user info from props, location state, or current user
  const email = userEmail || location.state?.userEmail || user?.email;
  const role = userRole || location.state?.userRole || user?.role;

  // Find the pending user record
  const pendingUser = pendingUsers.find(u => u.email === email && u.role === role);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate checking authorization status
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    
    // Check if user was approved
    if (pendingUser?.authorizationStatus === 'approved') {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'recruiter':
        return 'Recruiter';
      case 'issuer_admin':
        return 'Issuer Administrator';
      case 'issuer_staff':
        return 'Issuer Staff';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If user was rejected, show different message
  if (pendingUser?.authorizationStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 -z-10 hero-gradient opacity-30" />
        
        <Card className="w-full max-w-md glass-card border-red-500/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logoImage} alt="Kriti" className="h-16 w-auto" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-destructive">Authorization Rejected</CardTitle>
              <CardDescription className="text-base mt-2">
                Your registration request has been declined
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Unfortunately, your registration as {getRoleDisplayName(role || '')} has been rejected by our administrators.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Account Details</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Email: {email}</p>
                  <p>Role: {getRoleDisplayName(role || '')}</p>
                  {pendingUser?.authorizedAt && (
                    <p>Decision made: {formatDate(pendingUser.authorizedAt)}</p>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>If you believe this is an error, please contact our support team at <strong>support@kriti.edu</strong> with your registration details.</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/signup">
                  Try Again
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 hero-gradient opacity-30" />
      
      <Card className="w-full max-w-md glass-card border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="Kriti" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Authorization Pending</CardTitle>
            <CardDescription className="text-base mt-2">
              Your account is awaiting approval
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your registration as {getRoleDisplayName(role || '')} is currently under review by our administrators.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-6 rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Under Review</h3>
              <p className="text-sm text-muted-foreground">
                We're verifying your credentials and will notify you once your account is approved.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Account Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Email: {email}</p>
                <p>Role: {getRoleDisplayName(role || '')}</p>
                {pendingUser?.kritiId && (
                  <p>Kriti ID: <code className="bg-background px-1 rounded">{pendingUser.kritiId}</code></p>
                )}
                {pendingUser?.requestedAt && (
                  <p>Submitted: {formatDate(pendingUser.requestedAt)}</p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">What happens next?</p>
                  <p className="text-primary/80 mt-1">
                    You'll receive an email notification once your account is approved. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </Button>
            {user && (
              <Button variant="ghost" onClick={handleLogout} className="flex-1">
                Sign Out
              </Button>
            )}
          </div>
          
          {!user && (
            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}