import { useState } from 'react';
import { Shield, Users, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function AuthorizationDashboardPage() {
  const { user } = useAuth();
  const { getPendingUsers, authorizeUser } = useAuthStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Only authority users should access this page
  if (user?.role !== 'authority') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const pendingUsers = getPendingUsers();
  const pendingRecruiters = pendingUsers.filter(u => u.role === 'recruiter');
  const pendingIssuerAdmins = pendingUsers.filter(u => u.role === 'issuer_admin');

  const handleAuthorize = async (userId: string, status: 'approved' | 'rejected') => {
    setProcessingId(userId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    authorizeUser(userId, status, user?.name || 'System Admin');
    setProcessingId(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'recruiter':
        return 'default';
      case 'issuer_admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Authorization Dashboard</h1>
            <p className="text-muted-foreground">
              Review and authorize pending user registrations
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting authorization
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Recruiters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecruiters.length}</div>
            <p className="text-xs text-muted-foreground">
              Recruiter accounts
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingIssuerAdmins.length}</div>
            <p className="text-xs text-muted-foreground">
              Issuer admin accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingUsers.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground text-center">
              There are no pending authorization requests at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pending Authorization Requests</CardTitle>
            <CardDescription>
              Review and approve or reject user registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Carefully review each request before granting authorization. Approved users will gain access to sensitive features.
                </AlertDescription>
              </Alert>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Kriti ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((pendingUser) => (
                  <TableRow key={pendingUser.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-background">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{pendingUser.name}</p>
                          <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                          {pendingUser.aadhaarNumber && (
                            <p className="text-xs text-muted-foreground">
                              Aadhaar: {pendingUser.aadhaarNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(pendingUser.role)}>
                        {pendingUser.role === 'recruiter' ? 'Recruiter' : 
                         pendingUser.role === 'issuer_admin' ? 'Issuer Admin' : 
                         pendingUser.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pendingUser.requestedAt ? formatDate(pendingUser.requestedAt) : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {pendingUser.kritiId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAuthorize(pendingUser.id, 'approved')}
                          disabled={processingId === pendingUser.id}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {processingId === pendingUser.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAuthorize(pendingUser.id, 'rejected')}
                          disabled={processingId === pendingUser.id}
                        >
                          {processingId === pendingUser.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}