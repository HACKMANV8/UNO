import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Search, 
  Filter, 
  Award, 
  Calendar, 
  User, 
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Mock data for demonstration
const MOCK_CREDENTIALS = [
  {
    id: 'CRED-001',
    recipientName: 'Alice Johnson',
    recipientEmail: 'alice.johnson@example.com',
    title: 'Bachelor of Computer Science',
    type: 'academic',
    status: 'active',
    issuedDate: '2024-01-15',
    validUntil: '2028-01-15',
    skills: ['Programming', 'Data Structures', 'Algorithms'],
  },
  {
    id: 'CRED-002',
    recipientName: 'Bob Smith',
    recipientEmail: 'bob.smith@example.com',
    title: 'AWS Certified Developer',
    type: 'professional',
    status: 'active',
    issuedDate: '2024-02-20',
    validUntil: '2026-02-20',
    skills: ['AWS', 'Cloud Computing', 'DevOps'],
  },
  {
    id: 'CRED-003',
    recipientName: 'Carol Davis',
    recipientEmail: 'carol.davis@example.com',
    title: 'React Development Bootcamp',
    type: 'training',
    status: 'expired',
    issuedDate: '2023-06-10',
    validUntil: '2024-06-10',
    skills: ['React', 'JavaScript', 'Frontend Development'],
  },
  {
    id: 'CRED-004',
    recipientName: 'David Wilson',
    recipientEmail: 'david.wilson@example.com',
    title: 'Leadership Excellence',
    type: 'achievement',
    status: 'revoked',
    issuedDate: '2024-03-05',
    validUntil: '2025-03-05',
    skills: ['Leadership', 'Team Management', 'Communication'],
  },
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-yellow-100 text-yellow-800',
  revoked: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800',
};

const STATUS_ICONS = {
  active: CheckCircle,
  expired: Clock,
  revoked: XCircle,
  pending: Clock,
};

export default function IssuerHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCredential, setSelectedCredential] = useState<any>(null);

  const handleBackToDashboard = () => {
    navigate('/issuer/dashboard');
  };

  const handleViewCredential = (credential: any) => {
    setSelectedCredential(credential);
  };

  const filteredCredentials = MOCK_CREDENTIALS.filter((credential) => {
    const matchesSearch = 
      credential.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || credential.status === statusFilter;
    const matchesType = typeFilter === 'all' || credential.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Credential History</h1>
            <p className="text-muted-foreground">
              View and manage all issued credentials
            </p>
            <Badge variant="secondary" className="mt-2">
              {user?.role === 'issuer_admin' ? 'Admin' : 'Staff'}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issued Credentials</CardTitle>
          <CardDescription>
            View and manage all credentials you have issued ({MOCK_CREDENTIALS.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCredentials.length} of {MOCK_CREDENTIALS.length} credentials
            </p>
          </div>

          {/* Credentials Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credential ID</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-medium">{credential.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{credential.recipientName}</div>
                        <div className="text-sm text-muted-foreground">{credential.recipientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{credential.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {credential.skills.slice(0, 2).join(', ')}
                          {credential.skills.length > 2 && '...'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {credential.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(credential.status)}
                        <Badge 
                          className={`capitalize ${STATUS_COLORS[credential.status as keyof typeof STATUS_COLORS]}`}
                          variant="secondary"
                        >
                          {credential.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(credential.issuedDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(credential.validUntil).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewCredential(credential)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {credential.status === 'active' && user?.role === 'issuer_admin' && (
                          <Button variant="destructive" size="sm">
                            Revoke
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCredentials.length === 0 && (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">No credentials found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credential Details Dialog - Single close button */}
      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Credential Details</DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Credential ID</h4>
                  <p className="font-mono text-sm">{selectedCredential.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <Badge variant={selectedCredential.status === 'active' ? 'default' : 'destructive'}>
                    {selectedCredential.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                <p className="text-lg font-semibold">{selectedCredential.title}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Type</h4>
                <p className="capitalize">{selectedCredential.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Recipient Name</h4>
                  <p>{selectedCredential.recipientName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Recipient Email</h4>
                  <p>{selectedCredential.recipientEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Issued Date</h4>
                  <p>{new Date(selectedCredential.issuedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Valid Until</h4>
                  <p>{new Date(selectedCredential.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Associated Skills</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCredential.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1">
                  Download Certificate
                </Button>
                <Button variant="outline" className="flex-1">
                  Send Copy
                </Button>
                {selectedCredential.status === 'active' && user?.role === 'issuer_admin' && (
                  <Button variant="destructive" className="flex-1">
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}