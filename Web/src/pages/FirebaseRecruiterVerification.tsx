import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Award,
  Shield,
  Eye,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  getStudentByKritiId,
  getStudentCredentials,
  updateApplicantStatus,
  getApplicantsByRecruiter,
  KritiUser,
  StudentCredential,
  ApplicantStatus,
  CredentialType
} from '@/services/firebase';
import { verifyCredentialOnBlockchain } from '@/config/blockchain';
import { verifyCredentialSignature, getPublicKeyFromBlockchain, checkContractStatus } from '@/services/blockchain';
import { useAuthStore } from '@/store/firebaseAuthStore';

const credentialTypeLabels: Record<CredentialType, string> = {
  degree: 'Degree Certificate',
  certificate: 'Professional Certificate',
  diploma: 'Diploma Certificate',
  skill: 'Skill Certification',
  experience: 'Experience Letter',
};

const credentialTypeColors: Record<CredentialType, string> = {
  degree: 'text-primary bg-primary/10 border-primary/50',
  certificate: 'text-accent bg-accent/10 border-accent/50',
  diploma: 'text-purple-500 bg-purple-500/10 border-purple-500/50',
  skill: 'text-orange-500 bg-orange-500/10 border-orange-500/50',
  experience: 'text-teal-500 bg-teal-500/10 border-teal-500/50',
};

const statusColors = {
  applied: 'bg-primary/20 text-primary border-primary/50',
  reviewed: 'bg-accent/20 text-accent border-accent/50',
  interviewed: 'bg-secondary/20 text-secondary-foreground border-secondary/50',
  hired: 'bg-success/20 text-success border-success/50',
  rejected: 'bg-destructive/20 text-destructive border-destructive/50',
  waitlisted: 'bg-muted/20 text-muted-foreground border-muted/50',
} as const;

export default function FirebaseRecruiterVerification() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchKritiId, setSearchKritiId] = useState('');
  const [foundStudent, setFoundStudent] = useState<KritiUser | null>(null);
  const [studentCredentials, setStudentCredentials] = useState<StudentCredential[]>([]);
  const [applicants, setApplicants] = useState<ApplicantStatus[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean>>({});
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  
  // Form data for adding applicant  
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.uid) {
      loadApplicants();
      checkBlockchainConnection();
    }
  }, [user]);

  const checkBlockchainConnection = async () => {
    try {
      const isConnected = await checkContractStatus();
      setBlockchainConnected(isConnected);
    } catch (error) {
      console.error('Blockchain connection check failed:', error);
      setBlockchainConnected(false);
    }
  };

  const loadApplicants = async () => {
    if (!user?.uid) return;
    
    try {
      const recruiterApplicants = await getApplicantsByRecruiter(user.uid);
      setApplicants(recruiterApplicants);
    } catch (error) {
      console.error('Error loading applicants:', error);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchKritiId.trim()) {
      setSearchError('Please enter a Kriti ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setFoundStudent(null);
    setStudentCredentials([]);

    try {
      const student = await getStudentByKritiId(searchKritiId.trim().toUpperCase());
      if (student) {
        setFoundStudent(student);
        // Load student's credentials
        const credentials = await getStudentCredentials(student.kritiId!);
        setStudentCredentials(credentials);
      } else {
        setSearchError('Student not found with this Kriti ID');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      setSearchError('Error searching for student. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyCredential = async (credential: StudentCredential) => {
    setIsVerifying(prev => ({ ...prev, [credential.id]: true }));
    
    try {
      console.log('Verifying credential:', credential.id);
      
      // Check if credential has blockchain signature and issuer DID
      if (!credential.signature) {
        console.warn('Credential has no blockchain signature - may be legacy credential');
        setVerificationResults(prev => ({ ...prev, [credential.id]: false }));
        return;
      }

      // Try to extract issuer DID from credential (if stored) or create one
      const issuerDid = (credential as any).issuerDid || 
                       `did:kriti:issuer:${credential.issuerName?.toLowerCase().replace(/\s+/g, '-')}`;
      
      console.log('Using issuer DID:', issuerDid);

      // First check if issuer public key is registered on blockchain
      const publicKey = await getPublicKeyFromBlockchain(issuerDid);
      if (!publicKey) {
        console.error('Issuer not found on blockchain:', issuerDid);
        setVerificationResults(prev => ({ ...prev, [credential.id]: false }));
        return;
      }

      console.log('Found issuer public key on blockchain');

      // Verify the credential signature using blockchain
      const credentialDataForVerification = {
        studentKritiId: credential.studentKritiId,
        issuerUid: credential.issuerUid,
        issuerName: credential.issuerName,
        credentialType: credential.credentialType,
        credentialData: credential.credentialData,
        issuedDate: credential.issuedDate,
        expiryDate: credential.expiryDate,
        issuerDid: issuerDid,
      };

      const isValid = await verifyCredentialSignature(
        issuerDid,
        credentialDataForVerification,
        credential.signature
      );
      
      console.log('Verification result:', isValid);
      setVerificationResults(prev => ({ ...prev, [credential.id]: isValid }));
      
      if (isValid) {
        alert('✅ Credential verified successfully on blockchain!');
      } else {
        alert('❌ Credential verification failed - signature invalid or issuer not recognized.');
      }
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResults(prev => ({ ...prev, [credential.id]: false }));
      alert('🔥 Verification failed due to technical error. Please try again.');
    } finally {
      setIsVerifying(prev => ({ ...prev, [credential.id]: false }));
    }
  };

  const handleAddApplicant = async (status: ApplicantStatus['status']) => {
    if (!foundStudent || !user?.uid || !position.trim()) {
      return;
    }

    setIsUpdatingStatus(prev => ({ ...prev, [`${foundStudent.kritiId}-add`]: true }));

    try {
      await updateApplicantStatus(
        user.uid,
        foundStudent.kritiId!,
        status,
        position.trim(),
        notes.trim() || undefined
      );

      // Refresh applicants list
      await loadApplicants();
      
      // Reset form
      setPosition('');
      setNotes('');
      
      // Show success message
      alert(`Student added to ${status} list successfully!`);
    } catch (error) {
      console.error('Error adding applicant:', error);
      alert('Failed to add applicant. Please try again.');
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [`${foundStudent.kritiId}-add`]: false }));
    }
  };

  const handleUpdateApplicantStatus = async (applicant: ApplicantStatus, newStatus: ApplicantStatus['status']) => {
    setIsUpdatingStatus(prev => ({ ...prev, [applicant.id]: true }));

    try {
      await updateApplicantStatus(
        user!.uid,
        applicant.studentKritiId,
        newStatus,
        applicant.position,
        applicant.notes
      );

      // Refresh applicants list
      await loadApplicants();
    } catch (error) {
      console.error('Error updating applicant status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [applicant.id]: false }));
    }
  };

  if (!user || user.role !== 'recruiter') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <Building2 className="h-4 w-4" />
          <div>
            <h3>Access Denied</h3>
            <p>This page is only accessible to recruiters.</p>
          </div>
        </Alert>
      </div>
    );
  }

  if (user.status !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <Building2 className="h-4 w-4" />
          <div>
            <h3>Account Pending Approval</h3>
            <p>Your recruiter account is still pending approval. Please wait for admin approval.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Recruiter Verification</h1>
            <p className="text-muted-foreground">
              Search and verify candidate credentials
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>{user.companyName}</strong> • {user.industry}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={blockchainConnected ? "default" : "secondary"} className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain: {blockchainConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Candidate Search</span>
          </TabsTrigger>
          <TabsTrigger value="applicants" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>My Applicants ({applicants.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Search Candidate by Kriti ID</CardTitle>
              <CardDescription>
                Enter a student's Kriti ID to view their verified credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="searchKritiId">Kriti ID</Label>
                  <Input
                    id="searchKritiId"
                    placeholder="Enter Kriti ID (e.g., KT12345678)"
                    value={searchKritiId}
                    onChange={(e) => setSearchKritiId(e.target.value.toUpperCase())}
                    disabled={isSearching}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearchStudent}
                    disabled={isSearching || !searchKritiId.trim()}
                    variant="premium"
                  >
                    {isSearching ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {searchError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <div>
                    <p>{searchError}</p>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Student Details */}
          {foundStudent && (
            <Card className="glass-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Student Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {foundStudent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{foundStudent.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{foundStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{foundStudent.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Kriti ID: <strong>{foundStudent.kritiId}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined: {new Date(foundStudent.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Applicants */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-4">
                  <h4 className="font-semibold">Add to Your Applicant List</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        placeholder="e.g., Frontend Developer"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Any additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddApplicant('reviewed')}
                      disabled={!position.trim() || isUpdatingStatus[`${foundStudent.kritiId}-add`]}
                      variant="default"
                      size="sm"
                    >
                      {isUpdatingStatus[`${foundStudent.kritiId}-add`] ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add as Reviewed
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAddApplicant('waitlisted')}
                      disabled={!position.trim() || isUpdatingStatus[`${foundStudent.kritiId}-add`]}
                      variant="outline"
                      size="sm"
                    >
                      Add to Waitlist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Credentials */}
          {studentCredentials.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Verified Credentials ({studentCredentials.length})</span>
                </CardTitle>
                <CardDescription>
                  Click "Verify" to check blockchain authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentCredentials.map(credential => {
                  const colorClass = credentialTypeColors[credential.credentialType];
                  const isCredentialVerifying = isVerifying[credential.id];
                  const verificationResult = verificationResults[credential.id];
                  
                  return (
                    <div key={credential.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {credentialTypeLabels[credential.credentialType]}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Issued by {credential.issuerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(credential.issuedDate?.toDate?.() || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {credential.verified && (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {credential.signature ? (
                            <Badge className="bg-primary/20 text-primary border-primary/50">
                              <Shield className="h-3 w-3 mr-1" />
                              Blockchain Signed
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Legacy Credential
                            </Badge>
                          )}
                          {verificationResult !== undefined && (
                            <Badge className={verificationResult ? 
                              "bg-green-500/20 text-green-500 border-green-500/50" :
                              "bg-red-500/20 text-red-500 border-red-500/50"
                            }>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {verificationResult ? "Blockchain Verified" : "Verification Failed"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Credential Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(credential.credentialData || {}).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleVerifyCredential(credential)}
                          disabled={isCredentialVerifying}
                          variant="outline"
                          size="sm"
                        >
                          {isCredentialVerifying ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Verify on Blockchain
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applicants" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>My Applicants</CardTitle>
              <CardDescription>
                Manage your candidate pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applicants yet</p>
                  <p className="text-sm">Search for candidates and add them to your pipeline</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applicants.map(applicant => (
                    <div key={applicant.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">Kriti ID: {applicant.studentKritiId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Position: {applicant.position}
                          </p>
                          {applicant.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Notes: {applicant.notes}
                            </p>
                          )}
                        </div>
                        <Badge className={statusColors[applicant.status]}>
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Select 
                          value={applicant.status}
                          onValueChange={(value) => handleUpdateApplicantStatus(applicant, value as ApplicantStatus['status'])}
                          disabled={isUpdatingStatus[applicant.id]}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="waitlisted">Waitlisted</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {isUpdatingStatus[applicant.id] && (
                          <Spinner size="sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{applicants.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {applicants.filter(a => a.status === 'hired').length}
            </div>
            <p className="text-xs text-muted-foreground">Success rate: {applicants.length > 0 ? Math.round((applicants.filter(a => a.status === 'hired').length / applicants.length) * 100) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {applicants.filter(a => ['reviewed', 'interviewed'].includes(a.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Waitlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {applicants.filter(a => a.status === 'waitlisted').length}
            </div>
            <p className="text-xs text-muted-foreground">Future opportunities</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}