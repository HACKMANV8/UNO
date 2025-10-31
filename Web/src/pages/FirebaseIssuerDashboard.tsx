import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Award, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileText,
  Shield,
  User
} from 'lucide-react';
import { 
  issueCredential,
  getStudentByKritiId,
  getIssuerCredentials,
  createIssuerStaff,
  getIssuerStaffByAdmin,
  updateStaffStatus,
  deleteIssuerStaff,
  KritiUser,
  CredentialType,
  StudentCredential
} from '@/services/firebase';
import { useAuthStore } from '@/store/firebaseAuthStore';
import { 
  generateIssuerKeys, 
  registerIssuerOnBlockchain, 
  signCredential,
  checkContractStatus,
  connectWallet
} from '@/services/blockchain';

const credentialTypeLabels: Record<CredentialType, string> = {
  degree: 'Degree Certificate',
  certificate: 'Professional Certificate',
  diploma: 'Diploma Certificate',
  skill: 'Skill Certification',
  experience: 'Experience Letter',
};

export default function FirebaseIssuerDashboard() {
  const [activeTab, setActiveTab] = useState('issue');
  const [selectedCredentialType, setSelectedCredentialType] = useState<CredentialType | ''>('');
  const [studentKritiId, setStudentKritiId] = useState('');
  const [foundStudent, setFoundStudent] = useState<KritiUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Credential form data
  const [credentialData, setCredentialData] = useState<Record<string, string>>({});
  const [expiryDate, setExpiryDate] = useState('');
  
  // Staff management state
  const [staffMembers, setStaffMembers] = useState<KritiUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [showCreateStaffForm, setShowCreateStaffForm] = useState(false);
  
  // Credentials history state
  const [issuedCredentials, setIssuedCredentials] = useState<StudentCredential[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: ''
  });
  
  const { user } = useAuthStore();

  // Blockchain-related state
  const [issuerKeys, setIssuerKeys] = useState<{privateKey: string, publicKey: string, did: string} | null>(null);
  const [blockchainRegistered, setBlockchainRegistered] = useState(false);
  const [isRegisteringOnBlockchain, setIsRegisteringOnBlockchain] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<string>('Checking...');

  // Reset form
  const resetForm = () => {
    setSelectedCredentialType('');
    setStudentKritiId('');
    setFoundStudent(null);
    setCredentialData({});
    setExpiryDate('');
    setSearchError(null);
    setIssueError(null);
    setSuccessMessage(null);
  };

  // Initialize blockchain connection
  const initializeBlockchain = async () => {
    try {
      const contractOk = await checkContractStatus();
      if (contractOk) {
        setBlockchainStatus('Contract accessible');
      } else {
        setBlockchainStatus('Contract not deployed');
      }
    } catch (error) {
      console.error('Blockchain initialization error:', error);
      setBlockchainStatus('Connection failed');
    }
  };

  // Generate issuer keys for blockchain
  const handleGenerateKeys = () => {
    if (!user?.institutionName) {
      alert('Institution name is required to generate keys');
      return;
    }
    
    const keyPair = generateIssuerKeys(user.institutionName);
    setIssuerKeys(keyPair);
    
    // Store keys in localStorage for demo (in production, use secure storage)
    localStorage.setItem('issuer-keys', JSON.stringify(keyPair));
  };

  // Register issuer on blockchain
  const handleRegisterOnBlockchain = async () => {
    if (!issuerKeys) {
      alert('Please generate keys first');
      return;
    }

    setIsRegisteringOnBlockchain(true);
    try {
      const txHash = await registerIssuerOnBlockchain(
        issuerKeys.did,
        issuerKeys.publicKey
      );

      if (txHash) {
        setBlockchainRegistered(true);
        setSuccessMessage(`Successfully registered on blockchain! Transaction: ${txHash}`);
        
        // Store registration status
        localStorage.setItem('blockchain-registered', 'true');
      }
    } catch (error) {
      console.error('Blockchain registration error:', error);
      setIssueError('Failed to register on blockchain. Please try again.');
    } finally {
      setIsRegisteringOnBlockchain(false);
    }
  };

  // Load issuer keys from storage
  const loadStoredKeys = () => {
    const storedKeys = localStorage.getItem('issuer-keys');
    const registered = localStorage.getItem('blockchain-registered') === 'true';
    
    if (storedKeys) {
      setIssuerKeys(JSON.parse(storedKeys));
    }
    setBlockchainRegistered(registered);
  };

  // Search for student by KT ID
  const handleSearchStudent = async () => {
    if (!studentKritiId.trim()) {
      setSearchError('Please enter a Kriti ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setFoundStudent(null);

    try {
      const student = await getStudentByKritiId(studentKritiId.trim().toUpperCase());
      if (student) {
        setFoundStudent(student);
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

  // Handle form input changes
  const handleCredentialDataChange = (field: string, value: string) => {
    setCredentialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get form fields based on credential type
  const getCredentialFields = (type: CredentialType): Array<{key: string; label: string; type: string; required: boolean}> => {
    switch (type) {
      case 'degree':
        return [
          { key: 'degreeName', label: 'Degree Name', type: 'text', required: true },
          { key: 'major', label: 'Major/Specialization', type: 'text', required: true },
          { key: 'university', label: 'University', type: 'text', required: true },
          { key: 'graduationYear', label: 'Graduation Year', type: 'number', required: true },
          { key: 'gpa', label: 'GPA/Percentage', type: 'text', required: false },
          { key: 'honors', label: 'Honors/Distinction', type: 'text', required: false },
        ];
      case 'certificate':
        return [
          { key: 'certificateName', label: 'Certificate Name', type: 'text', required: true },
          { key: 'issuingOrganization', label: 'Issuing Organization', type: 'text', required: true },
          { key: 'completionDate', label: 'Completion Date', type: 'date', required: true },
          { key: 'certificateId', label: 'Certificate ID', type: 'text', required: false },
          { key: 'validUntil', label: 'Valid Until', type: 'date', required: false },
        ];
      case 'diploma':
        return [
          { key: 'diplomaName', label: 'Diploma Name', type: 'text', required: true },
          { key: 'institution', label: 'Institution', type: 'text', required: true },
          { key: 'duration', label: 'Duration', type: 'text', required: true },
          { key: 'completionYear', label: 'Completion Year', type: 'number', required: true },
          { key: 'grade', label: 'Grade/Score', type: 'text', required: false },
        ];
      case 'skill':
        return [
          { key: 'skillName', label: 'Skill Name', type: 'text', required: true },
          { key: 'level', label: 'Skill Level', type: 'text', required: true },
          { key: 'assessmentDate', label: 'Assessment Date', type: 'date', required: true },
          { key: 'assessor', label: 'Assessor/Evaluator', type: 'text', required: true },
          { key: 'score', label: 'Score/Rating', type: 'text', required: false },
        ];
      case 'experience':
        return [
          { key: 'companyName', label: 'Company Name', type: 'text', required: true },
          { key: 'position', label: 'Position/Role', type: 'text', required: true },
          { key: 'startDate', label: 'Start Date', type: 'date', required: true },
          { key: 'endDate', label: 'End Date', type: 'date', required: true },
          { key: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: false },
          { key: 'supervisor', label: 'Supervisor Name', type: 'text', required: false },
        ];
      default:
        return [];
    }
  };

  // Issue credential
  const handleIssueCredential = async () => {
    if (!selectedCredentialType || !foundStudent || !user) {
      return;
    }

    // Validate required fields
    const fields = getCredentialFields(selectedCredentialType);
    const requiredFields = fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !credentialData[f.key]?.trim());
    
    if (missingFields.length > 0) {
      setIssueError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Check if blockchain is set up for signing
    if (!issuerKeys || !blockchainRegistered) {
      setIssueError('Please complete blockchain setup (generate keys and register) before issuing credentials.');
      return;
    }

    setIsIssuing(true);
    setIssueError(null);

    try {
      // Create base credential data
      const baseCredentialData = {
        studentKritiId: foundStudent.kritiId!,
        issuerUid: user.uid,
        issuerName: user.institutionName || user.name,
        credentialType: selectedCredentialType,
        credentialData: credentialData,
        issuedDate: new Date().toISOString(),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        issuerDid: issuerKeys.did,
      };

      // Sign the credential with blockchain
      const signature = await signCredential(baseCredentialData, issuerKeys.privateKey);

      const credentialPayload = {
        ...baseCredentialData,
        verified: true,
        signature: signature,
        blockchainHash: '', // This would be populated if storing on IPFS
      };

      const credentialId = await issueCredential(credentialPayload);
      
      setSuccessMessage(`Credential issued successfully with blockchain signature! Credential ID: ${credentialId}`);
      
      // Refresh the credentials list
      loadIssuedCredentials();
      
      // Reset form after successful issuance
      setTimeout(() => {
        resetForm();
        setSuccessMessage(null);
      }, 3000);

    } catch (error) {
      console.error('Error issuing credential:', error);
      setIssueError('Failed to issue credential. Please try again.');
    } finally {
      setIsIssuing(false);
    }
  };

  // Staff management functions
  const loadStaffMembers = async () => {
    if (user?.role !== 'issuer_admin') return;
    
    setIsLoadingStaff(true);
    try {
      const staff = await getIssuerStaffByAdmin(user.uid);
      setStaffMembers(staff.filter(s => s.status !== 'deleted'));
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!user || user.role !== 'issuer_admin') return;

    // Validate form
    if (!staffFormData.name || !staffFormData.email || !staffFormData.password) {
      setIssueError('Name, email, and password are required');
      return;
    }

    setIsCreatingStaff(true);
    setIssueError(null);

    try {
      await createIssuerStaff(user.uid, staffFormData);
      setSuccessMessage('Staff member created successfully!');
      
      // Reset form and reload staff
      setStaffFormData({
        name: '', email: '', password: '', phone: '', 
        employeeId: '', department: '', designation: ''
      });
      setShowCreateStaffForm(false);
      await loadStaffMembers();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error creating staff:', error);
      setIssueError(error.message || 'Failed to create staff member');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleToggleStaffStatus = async (staffUid: string, currentStatus: boolean) => {
    try {
      await updateStaffStatus(staffUid, !currentStatus);
      await loadStaffMembers();
      setSuccessMessage(`Staff member ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Error updating staff status:', error);
      setIssueError('Failed to update staff status');
    }
  };

  const handleDeleteStaff = async (staffUid: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteIssuerStaff(user!.uid, staffUid);
      await loadStaffMembers();
      setSuccessMessage('Staff member deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      setIssueError(error.message || 'Failed to delete staff member');
    }
  };

  // Load issued credentials
  const loadIssuedCredentials = async () => {
    if (!user?.uid) return;
    
    setIsLoadingCredentials(true);
    try {
      const credentials = await getIssuerCredentials(user.uid);
      setIssuedCredentials(credentials);
    } catch (error) {
      console.error('Error loading issued credentials:', error);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  // Load staff members and credentials when component mounts
  useEffect(() => {
    if (user?.uid) {
      loadIssuedCredentials();
      if (user.role === 'issuer_admin') {
        loadStaffMembers();
      }
      // Initialize blockchain
      initializeBlockchain();
      loadStoredKeys();
    }
  }, [user]);

  if (!user || (user.role !== 'issuer_admin' && user.role !== 'issuer_staff')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <GraduationCap className="h-4 w-4" />
          <div>
            <h3>Access Denied</h3>
            <p>This page is only accessible to authorized issuers.</p>
          </div>
        </Alert>
      </div>
    );
  }

  if (user.status !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <GraduationCap className="h-4 w-4" />
          <div>
            <h3>Account Pending Approval</h3>
            <p>Your issuer account is still pending approval. Please wait for admin approval.</p>
          </div>
        </Alert>
      </div>
    );
  }

  const credentialFields = selectedCredentialType ? getCredentialFields(selectedCredentialType) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
            <p className="text-muted-foreground">
              Issue and manage verified credentials
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>{user.institutionName || user.name}</strong> • {user.institutionType}
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-accent/50 bg-accent/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div className="text-green-500">
            <h3>Success</h3>
            <p>{successMessage}</p>
          </div>
        </Alert>
      )}

      {issueError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <div>
            <h3>Error</h3>
            <p>{issueError}</p>
          </div>
        </Alert>
      )}

      <Tabs defaultValue="issue" className="space-y-6">
        <TabsList className={`grid w-full ${user?.role === 'issuer_admin' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="issue" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Issue Credential</span>
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Blockchain Setup</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Issued History</span>
          </TabsTrigger>
          {user?.role === 'issuer_admin' && (
            <TabsTrigger value="staff" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Manage Staff</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="issue" className="space-y-6">
          {/* Allowed Credential Types */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Authorized Credential Types</CardTitle>
              <CardDescription>
                You can issue the following types of credentials:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.allowedCredentialTypes?.map(type => (
                  <Badge key={type} variant="outline" className="bg-primary/5">
                    {credentialTypeLabels[type]}
                  </Badge>
                )) || (
                  <p className="text-muted-foreground text-sm">No credential types authorized yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credential Issuance Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Issue New Credential</CardTitle>
              <CardDescription>
                Search for a student and issue a verified credential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Select Credential Type */}
              <div className="space-y-2">
                <Label htmlFor="credentialType">Step 1: Select Credential Type</Label>
                <Select 
                  value={selectedCredentialType} 
                  onValueChange={(value) => setSelectedCredentialType(value as CredentialType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.allowedCredentialTypes?.map(type => (
                      <SelectItem key={type} value={type}>
                        {credentialTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Search Student */}
              {selectedCredentialType && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentKritiId">Step 2: Find Student</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="studentKritiId"
                        placeholder="Enter Student's Kriti ID (e.g., KT12345678)"
                        value={studentKritiId}
                        onChange={(e) => setStudentKritiId(e.target.value.toUpperCase())}
                        disabled={isSearching}
                      />
                      <Button
                        onClick={handleSearchStudent}
                        disabled={isSearching || !studentKritiId.trim()}
                        variant="outline"
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
                    {searchError && (
                      <p className="text-sm text-destructive">{searchError}</p>
                    )}
                  </div>

                  {/* Student Found */}
                  {foundStudent && (
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-green-500">Student Found</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p><strong>Name:</strong> {foundStudent.name}</p>
                        <p><strong>Email:</strong> {foundStudent.email}</p>
                        <p><strong>Kriti ID:</strong> {foundStudent.kritiId}</p>
                        <p><strong>Phone:</strong> {foundStudent.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Credential Details */}
              {foundStudent && selectedCredentialType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 3: Enter Credential Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {credentialFields.map(field => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.key}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={credentialData[field.key] || ''}
                            onChange={(e) => handleCredentialDataChange(field.key, e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={credentialData[field.key] || ''}
                            onChange={(e) => handleCredentialDataChange(field.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>

                  {/* Issue Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleIssueCredential}
                      disabled={isIssuing}
                      variant="premium"
                      className="w-full"
                    >
                      {isIssuing ? (
                        <>
                          <Spinner size="sm" />
                          Issuing Credential...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Issue Credential
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Blockchain Setup</span>
              </CardTitle>
              <CardDescription>
                Set up your institution's blockchain identity for secure credential issuance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Blockchain Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={blockchainStatus === 'Contract accessible' ? 'default' : 'secondary'}>
                      {blockchainStatus}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Registration Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={blockchainRegistered ? 'default' : 'secondary'}>
                      {blockchainRegistered ? 'Registered' : 'Not Registered'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key Generation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Issuer Keys</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate cryptographic keys for signing credentials
                    </p>
                  </div>
                  {!issuerKeys ? (
                    <Button onClick={handleGenerateKeys} variant="outline">
                      Generate Keys
                    </Button>
                  ) : (
                    <Badge variant="default">Keys Generated</Badge>
                  )}
                </div>

                {issuerKeys && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-xs">DID (Decentralized Identifier)</Label>
                      <p className="text-sm font-mono break-all">{issuerKeys.did}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Public Key</Label>
                      <p className="text-sm font-mono break-all">{issuerKeys.publicKey.substring(0, 50)}...</p>
                    </div>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <div>
                        <p className="text-sm">Keys have been generated and stored locally. Keep your private key secure!</p>
                      </div>
                    </Alert>
                  </div>
                )}
              </div>

              {/* Blockchain Registration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Blockchain Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Register your public key on the blockchain for verification
                    </p>
                  </div>
                  {!blockchainRegistered ? (
                    <Button 
                      onClick={handleRegisterOnBlockchain}
                      disabled={!issuerKeys || isRegisteringOnBlockchain}
                      variant="default"
                    >
                      {isRegisteringOnBlockchain ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Registering...
                        </>
                      ) : (
                        'Register on Blockchain'
                      )}
                    </Button>
                  ) : (
                    <Badge variant="default">Registered</Badge>
                  )}
                </div>

                {!issuerKeys && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <div>
                      <p>Please generate keys first before registering on blockchain.</p>
                    </div>
                  </Alert>
                )}

                {issuerKeys && !blockchainRegistered && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <div>
                      <p>Make sure you have MetaMask installed and connected to Polygon Amoy testnet with some test MATIC for gas fees.</p>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Setup Instructions */}
              <div className="space-y-4">
                <Label>Setup Instructions</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${blockchainStatus === 'Contract accessible' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      1
                    </span>
                    <span>Smart contract must be deployed and accessible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${issuerKeys ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      2
                    </span>
                    <span>Generate cryptographic keys for your institution</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${blockchainRegistered ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      3
                    </span>
                    <span>Register your public key on the blockchain</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${blockchainRegistered ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      4
                    </span>
                    <span>Start issuing blockchain-verified credentials</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Issued Credentials History</CardTitle>
              <CardDescription>
                View all credentials you have issued ({issuedCredentials.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCredentials ? (
                <div className="text-center py-8">
                  <Spinner className="h-8 w-8 mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading credentials...</p>
                </div>
              ) : issuedCredentials.length > 0 ? (
                <div className="space-y-4">
                  {issuedCredentials.map((credential) => (
                    <div key={credential.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {credential.credentialType.toUpperCase()}
                            </Badge>
                            {credential.verified && (
                              <Badge variant="default" className="bg-accent/20 text-accent border-accent/50">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold">Student ID: {credential.studentKritiId}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Issued:</strong> {credential.issuedDate?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                              {credential.expiryDate && (
                                <p><strong>Expires:</strong> {credential.expiryDate.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <p><strong>Credential ID:</strong> {credential.id}</p>
                              <p><strong>Issuer:</strong> {credential.issuerName}</p>
                            </div>
                          </div>
                          {credential.credentialData && Object.keys(credential.credentialData).length > 0 && (
                            <div className="mt-3 p-3 bg-muted/30 rounded">
                              <p className="text-sm font-medium mb-2">Credential Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(credential.credentialData).map(([key, value]) => (
                                  <div key={key}>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No credentials issued yet</p>
                  <p className="text-sm">Credentials you issue will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management Tab - Only for Issuer Admins */}
        {user?.role === 'issuer_admin' && (
          <TabsContent value="staff" className="space-y-6">
            {/* Create Staff Section */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>
                      Create and manage issuer staff accounts for your institution
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowCreateStaffForm(!showCreateStaffForm)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              
              {showCreateStaffForm && (
                <CardContent className="border-t">
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffName">Full Name *</Label>
                        <Input
                          id="staffName"
                          placeholder="Enter staff member's name"
                          value={staffFormData.name}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="staffEmail">Email Address *</Label>
                        <Input
                          id="staffEmail"
                          type="email"
                          placeholder="staff@institution.edu"
                          value={staffFormData.email}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="staffPassword">Password *</Label>
                        <Input
                          id="staffPassword"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={staffFormData.password}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="staffPhone">Phone Number</Label>
                        <Input
                          id="staffPhone"
                          placeholder="+91 98765 43210"
                          value={staffFormData.phone}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="staffEmployeeId">Employee ID</Label>
                        <Input
                          id="staffEmployeeId"
                          placeholder="EMP-001"
                          value={staffFormData.employeeId}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="staffDepartment">Department</Label>
                        <Input
                          id="staffDepartment"
                          placeholder="Academic Affairs"
                          value={staffFormData.department}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, department: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="staffDesignation">Designation</Label>
                        <Input
                          id="staffDesignation"
                          placeholder="Credential Officer"
                          value={staffFormData.designation}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, designation: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateStaff}
                        disabled={isCreatingStaff}
                        className="flex-1"
                      >
                        {isCreatingStaff ? (
                          <>
                            <Spinner size="sm" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Create Staff Account
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => setShowCreateStaffForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Staff List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Current Staff Members ({staffMembers.length})</CardTitle>
                <CardDescription>
                  Manage your institution's credential issuing staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStaff ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" />
                    <span className="ml-2">Loading staff members...</span>
                  </div>
                ) : staffMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No staff members yet</p>
                    <p className="text-sm">Create staff accounts to help with credential issuance</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {staffMembers.map(staff => (
                      <div key={staff.uid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{staff.name}</h4>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                              {staff.designation && <span>{staff.designation}</span>}
                              {staff.department && <span>• {staff.department}</span>}
                              {staff.employeeId && <span>• ID: {staff.employeeId}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={staff.isActive !== false ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                            {staff.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          <Button
                            onClick={() => handleToggleStaffStatus(staff.uid, staff.isActive !== false)}
                            variant="outline"
                            size="sm"
                          >
                            {staff.isActive !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          <Button
                            onClick={() => handleDeleteStaff(staff.uid)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Statistics */}
      <div className={`grid grid-cols-1 gap-6 ${user?.role === 'issuer_admin' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Authorized Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {user.allowedCredentialTypes?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Credential types</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Issued Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">0</div>
            <p className="text-xs text-muted-foreground">Credentials issued</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        {user?.role === 'issuer_admin' && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {staffMembers.filter(s => s.isActive !== false).length}
              </div>
              <p className="text-xs text-muted-foreground">Staff members</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}