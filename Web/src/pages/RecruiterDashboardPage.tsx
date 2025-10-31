import { useState, useEffect } from 'react';
import { Users, Eye, Mail, Phone, GraduationCap, Briefcase, Calendar, Search, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/firebaseAuthStore';
import FirebaseRecruiterVerification from './FirebaseRecruiterVerification';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  education: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  kritiId: string;
}

export default function RecruiterDashboardPage() {
  const [showVerification, setShowVerification] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // All hooks must be declared before any conditional returns
  const [applicants] = useState<Applicant[]>([
    {
      id: '1',
      name: 'Arjun Sharma',
      email: 'arjun.sharma@example.com',
      phone: '+91 98765 43210',
      position: 'Frontend Developer',
      experience: '3 years',
      education: 'B.Tech Computer Science',
      appliedDate: '2024-10-28',
      status: 'new',
      kritiId: 'KRITI-STU123'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 87654 32109',
      position: 'Full Stack Developer',
      experience: '5 years',
      education: 'M.Tech Software Engineering',
      appliedDate: '2024-10-27',
      status: 'reviewed',
      kritiId: 'KRITI-STU456'
    },
    {
      id: '3',
      name: 'Rohit Kumar',
      email: 'rohit.kumar@example.com',
      phone: '+91 76543 21098',
      position: 'Backend Developer',
      experience: '2 years',
      education: 'B.Tech Information Technology',
      appliedDate: '2024-10-26',
      status: 'interviewed',
      kritiId: 'KRITI-STU789'
    },
    {
      id: '4',
      name: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      phone: '+91 65432 10987',
      position: 'UI/UX Designer',
      experience: '4 years',
      education: 'B.Des Visual Communication',
      appliedDate: '2024-10-25',
      status: 'hired',
      kritiId: 'KRITI-STU101'
    },
    {
      id: '5',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 54321 09876',
      position: 'DevOps Engineer',
      experience: '6 years',
      education: 'M.Tech Cloud Computing',
      appliedDate: '2024-10-24',
      status: 'rejected',
      kritiId: 'KRITI-STU112'
    }
  ]);

  // Check if user is Firebase user, if so show Firebase version
  useEffect(() => {
    if (user?.uid) {
      setShowVerification(true);
    }
  }, [user]);

  // Conditional return after all hooks are declared
  if (showVerification) {
    return <FirebaseRecruiterVerification />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'reviewed': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'interviewed': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'hired': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and review job applicants
            </p>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Job Applicants</CardTitle>
          <CardDescription>
            Review and manage applications for your open positions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="p-6 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {applicant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{applicant.name}</h3>
                    <p className="text-sm text-muted-foreground">Applied for {applicant.position}</p>
                    <p className="text-xs text-muted-foreground">Kriti ID: {applicant.kritiId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(applicant.status)}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{applicant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{applicant.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{applicant.experience}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Education:</span>
                  <span className="font-medium">{applicant.education}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicants.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{applicants.filter(a => a.status === 'new').length}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Interviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{applicants.filter(a => a.status === 'interviewed').length}</div>
            <p className="text-xs text-muted-foreground">In process</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{applicants.filter(a => a.status === 'hired').length}</div>
            <p className="text-xs text-muted-foreground">Success rate: {Math.round((applicants.filter(a => a.status === 'hired').length / applicants.length) * 100)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
