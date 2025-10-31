import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  GraduationCap, 
  Award, 
  Calendar, 
  Building2,
  CheckCircle,
  Download,
  Eye,
  Shield
} from 'lucide-react';
import { 
  getStudentCredentials, 
  StudentCredential,
  CredentialType
} from '@/services/firebase';
import { useAuthStore } from '@/store/firebaseAuthStore';

// Utility function to safely format dates from Firebase
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  
  try {
    // If it's a Firebase Timestamp, use toDate()
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return new Date(dateValue.toDate()).toLocaleDateString();
    }
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    // If it's a string or number, convert to Date
    return new Date(dateValue).toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const credentialTypeLabels: Record<CredentialType, string> = {
  degree: 'Degree Certificate',
  certificate: 'Professional Certificate',
  diploma: 'Diploma Certificate',
  skill: 'Skill Certification',
  experience: 'Experience Letter',
};

const credentialTypeIcons: Record<CredentialType, any> = {
  degree: GraduationCap,
  certificate: Award,
  diploma: GraduationCap,
  skill: Award,
  experience: Building2,
};

const credentialTypeColors: Record<CredentialType, string> = {
  degree: 'text-primary bg-primary/10 border-primary/50',
  certificate: 'text-accent bg-accent/10 border-accent/50',
  diploma: 'text-purple-500 bg-purple-500/10 border-purple-500/50',
  skill: 'text-orange-500 bg-orange-500/10 border-orange-500/50',
  experience: 'text-teal-500 bg-teal-500/10 border-teal-500/50',
};

export default function FirebaseStudentDashboard() {
  const [credentials, setCredentials] = useState<StudentCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.kritiId) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
    if (!user?.kritiId) return;
    
    try {
      setIsLoading(true);
      const userCredentials = await getStudentCredentials(user.kritiId);
      setCredentials(userCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError('Failed to load your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const CredentialCard = ({ credential }: { credential: StudentCredential }) => {
    const Icon = credentialTypeIcons[credential.credentialType];
    const colorClass = credentialTypeColors[credential.credentialType];
    
    return (
      <Card className="glass-card hover:border-primary/30 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {credentialTypeLabels[credential.credentialType]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Issued by {credential.issuerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(credential.issuedDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {credential.verified && (
                <Badge className="bg-accent/20 text-accent border-accent/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {credential.blockchainHash && (
                <Badge className="bg-primary/20 text-primary border-primary/50">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Credential Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(credential.credentialData || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {credential.expiryDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Expires: {formatDate(credential.expiryDate)}
              </span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <User className="h-4 w-4" />
          <div>
            <h3>Access Denied</h3>
            <p>This page is only accessible to students.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Student</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground">Kriti ID</p>
                  <p className="font-bold text-primary">{user.kritiId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Credentials Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>My Credentials</span>
          </CardTitle>
          <CardDescription>
            Your verified credentials issued by authorized institutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading your credentials...</span>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Credentials Yet</p>
              <p className="text-sm">
                Your credentials will appear here once issued by authorized institutions.
              </p>
              <p className="text-xs mt-2">
                Share your Kriti ID <strong>{user.kritiId}</strong> with institutions to receive credentials.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {credentials.map(credential => (
                <CredentialCard key={credential.id} credential={credential} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{credentials.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {credentials.filter(c => c.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">Verified credentials</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blockchain Secured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {credentials.filter(c => c.blockchainHash).length}
            </div>
            <p className="text-xs text-muted-foreground">Tamper-proof</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {credentials.filter(c => {
                const issuedDate = new Date(c.issuedDate?.toDate?.() || c.issuedDate || 0);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return issuedDate > thirtyDaysAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}