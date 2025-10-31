import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, GraduationCap, Copy, CheckCircle, Award, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function IssuerSignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [issuerId, setIssuerId] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    adminName: '',
    issuerTypes: [] as string[]
  });

  const issuerTypeOptions = [
    {
      id: 'certificate',
      label: 'Certificates',
      description: 'Course completion, training certificates, skill certifications',
      icon: Award
    },
    {
      id: 'degree',
      label: 'Degrees',
      description: 'Academic degrees, diplomas, graduation certificates',
      icon: GraduationCap
    },
    {
      id: 'result',
      label: 'Results',
      description: 'Exam results, marksheets, grade reports',
      icon: TrendingUp
    }
  ];

  const handleIssuerTypeChange = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      issuerTypes: checked 
        ? [...prev.issuerTypes, typeId]
        : prev.issuerTypes.filter(id => id !== typeId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.organizationName || !formData.email || !formData.password || !formData.adminName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.issuerTypes.length === 0) {
      setError('Please select at least one issuer type');
      return;
    }

    try {
      await signup({
        name: formData.adminName,
        email: formData.email,
        password: formData.password,
        role: 'issuer_admin',
      });
      
      // Generate issuer ID for display
      const id = 'ISS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setIssuerId(id);
      setShowSuccessModal(true);
    } catch (err: any) {
      const errorMessage = err?.message;
      
      switch (errorMessage) {
        case 'AUTHORIZATION_REQUIRED':
          setError('Registration submitted! Your account is pending authorization. You will be notified via email once approved.');
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: 'issuer_admin' } 
            });
          }, 3000);
          break;
        case 'ALREADY_PENDING':
          setError('An account with this email is already pending authorization.');
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: 'issuer_admin' } 
            });
          }, 2000);
          break;
        case 'PREVIOUSLY_REJECTED':
          setError('This account was previously rejected. Please contact support if you believe this is an error.');
          break;
        case 'ALREADY_EXISTS':
          setError('An account with this email already exists. Please try logging in instead.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    }
  };

  const copyIssuerId = () => {
    navigator.clipboard.writeText(issuerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please login with your credentials.',
        email: formData.email 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/signup')}
            className="mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Issuer Registration</CardTitle>
          <CardDescription>
            Register your institution to issue verified credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                placeholder="Enter your institution name"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Official Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@institution.edu"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name *</Label>
              <Input
                id="adminName"
                placeholder="Registrar / Admin name"
                value={formData.adminName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Issuer Type (Select all that apply) *</Label>
              <div className="space-y-3">
                {issuerTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={option.id}
                        checked={formData.issuerTypes.includes(option.id)}
                        onCheckedChange={(checked) => handleIssuerTypeChange(option.id, checked as boolean)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the types of credentials your organization will issue
              </p>
            </div>

            <Button 
              type="submit" 
              variant="premium" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Creating Account...
                </>
              ) : (
                'Register Institution'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span>Registration Successful!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your issuer account has been created successfully. Here's your unique Issuer ID:
            </p>
            
            <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issuer ID</p>
                  <p className="text-lg font-mono font-bold text-primary">{issuerId}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyIssuerId}>
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Selected Services:</strong> {formData.issuerTypes.map(type => 
                  issuerTypeOptions.find(opt => opt.id === type)?.label
                ).join(', ')}
              </p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Important:</strong> Please save this Issuer ID safely. You'll need it for staff account creation and support.
              </p>
            </div>

            <Button onClick={handleModalClose} className="w-full" variant="premium">
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}