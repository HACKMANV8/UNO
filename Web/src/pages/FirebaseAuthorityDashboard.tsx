import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  Building2, 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import { 
  getPendingUsers, 
  updateUserStatus, 
  KritiUser,
  CredentialType 
} from '@/services/firebase';
import { useAuthStore } from '@/store/firebaseAuthStore';

const credentialTypeLabels: Record<CredentialType, string> = {
  degree: 'Degree Certificates',
  certificate: 'Professional Certificates',
  diploma: 'Diploma Certificates',
  skill: 'Skill Certifications',
  experience: 'Experience Letters',
};

export default function FirebaseAuthorityDashboard() {
  const [pendingRecruiters, setPendingRecruiters] = useState<KritiUser[]>([]);
  const [pendingIssuers, setPendingIssuers] = useState<KritiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Loading pending users...');
      
      const [recruiters, issuers] = await Promise.all([
        getPendingUsers('recruiter'),
        getPendingUsers('issuer_admin')
      ]);
      
      console.log('Pending recruiters:', recruiters);
      console.log('Pending issuers:', issuers);
      
      setPendingRecruiters(recruiters);
      setPendingIssuers(issuers);
    } catch (error) {
      console.error('Error loading pending users:', error);
      setError('Failed to load pending applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string, 
    action: 'approved' | 'rejected',
    allowedCredentialTypes?: CredentialType[]
  ) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      setError(null);

      await updateUserStatus(userId, action, allowedCredentialTypes);
      
      // Refresh the lists
      await loadPendingUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const UserCard = ({ user: pendingUser, type }: { user: KritiUser; type: 'recruiter' | 'issuer' }) => (
    <Card className="glass-card hover:border-primary/30 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {pendingUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{pendingUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {type === 'recruiter' ? pendingUser.companyName : pendingUser.institutionName}
              </p>
              <p className="text-xs text-muted-foreground">
                Applied: {new Date(pendingUser.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pendingUser.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pendingUser.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Aadhaar: {pendingUser.aadhaarNumber}</span>
          </div>
          {type === 'recruiter' && (
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {pendingUser.companySize} • {pendingUser.industry}
              </span>
            </div>
          )}
        </div>

        {type === 'issuer' && pendingUser.allowedCredentialTypes && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Requested Credential Types:</p>
            <div className="flex flex-wrap gap-2">
              {pendingUser.allowedCredentialTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {credentialTypeLabels[type]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90"
            onClick={() => handleUserAction(
              pendingUser.uid, 
              'approved', 
              type === 'issuer' ? pendingUser.allowedCredentialTypes : undefined
            )}
            disabled={processingUsers.has(pendingUser.uid)}
          >
            {processingUsers.has(pendingUser.uid) ? (
              <Spinner size="sm" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => handleUserAction(pendingUser.uid, 'rejected')}
            disabled={processingUsers.has(pendingUser.uid)}
          >
            {processingUsers.has(pendingUser.uid) ? (
              <Spinner size="sm" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user || user.role !== 'authority') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <div>
            <h3>Access Denied</h3>
            <p>You don't have permission to access this page.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Authority Dashboard</h1>
            <p className="text-muted-foreground">
              Review and approve platform applications
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <Tabs defaultValue="recruiters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recruiters" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Recruiters ({pendingRecruiters.length})</span>
          </TabsTrigger>
          <TabsTrigger value="issuers" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>Issuers ({pendingIssuers.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recruiters" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Pending Recruiter Applications</span>
              </CardTitle>
              <CardDescription>
                Review and approve recruiter registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                  <span className="ml-2">Loading applications...</span>
                </div>
              ) : pendingRecruiters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending recruiter applications</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingRecruiters.map(recruiter => (
                    <UserCard key={recruiter.uid} user={recruiter} type="recruiter" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issuers" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Pending Issuer Applications</span>
              </CardTitle>
              <CardDescription>
                Review and approve issuer registrations with credential type permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                  <span className="ml-2">Loading applications...</span>
                </div>
              ) : pendingIssuers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending issuer applications</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingIssuers.map(issuer => (
                    <UserCard key={issuer.uid} user={issuer} type="issuer" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {pendingRecruiters.length + pendingIssuers.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recruiters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{pendingRecruiters.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Issuers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{pendingIssuers.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}