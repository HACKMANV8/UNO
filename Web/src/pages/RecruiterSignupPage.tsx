import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, Building2, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RecruiterSignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recruiterId, setRecruiterId] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    adminName: '',
    gstNumber: '',
    websiteLink: '',
    linkedinLink: '',
    otherLinks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.organizationName || !formData.email || !formData.password || !formData.adminName || !formData.gstNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.gstNumber.length !== 15) {
      setError('GST number must be 15 characters');
      return;
    }

    try {
      await signup({
        name: formData.adminName,
        email: formData.email,
        password: formData.password,
        role: 'recruiter',
      });
      
      // Generate recruiter ID for display
      const id = 'REC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setRecruiterId(id);
      setShowSuccessModal(true);
    } catch (err: any) {
      const errorMessage = err?.message;
      
      switch (errorMessage) {
        case 'AUTHORIZATION_REQUIRED':
          setError('Registration submitted! Your account is pending authorization. You will be notified via email once approved.');
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: 'recruiter' } 
            });
          }, 3000);
          break;
        case 'ALREADY_PENDING':
          setError('An account with this email is already pending authorization.');
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: 'recruiter' } 
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

  const copyRecruiterId = () => {
    navigator.clipboard.writeText(recruiterId);
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
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Recruiter Registration</CardTitle>
          <CardDescription>
            Register your organization to access verified talent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                placeholder="Enter your company name"
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
                placeholder="admin@company.com"
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
                placeholder="HR Manager / Admin name"
                value={formData.adminName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number *</Label>
              <Input
                id="gstNumber"
                placeholder="15-digit GST number"
                value={formData.gstNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                maxLength={15}
                required
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-base font-medium">Company Links (Optional)</Label>
              
              <div className="space-y-2">
                <Label htmlFor="websiteLink" className="text-sm text-muted-foreground">Website URL</Label>
                <Input
                  id="websiteLink"
                  placeholder="https://www.company.com"
                  value={formData.websiteLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteLink: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinLink" className="text-sm text-muted-foreground">LinkedIn Company Page</Label>
                <Input
                  id="linkedinLink"
                  placeholder="https://linkedin.com/company/..."
                  value={formData.linkedinLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinLink: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherLinks" className="text-sm text-muted-foreground">Other Links</Label>
                <Textarea
                  id="otherLinks"
                  placeholder="Any other relevant links (social media, careers page, etc.)"
                  value={formData.otherLinks}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherLinks: e.target.value }))}
                  rows={3}
                />
              </div>
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
                'Register Organization'
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
              Your recruiter account has been created successfully. Here's your unique Recruiter ID:
            </p>
            
            <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recruiter ID</p>
                  <p className="text-lg font-mono font-bold text-primary">{recruiterId}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyRecruiterId}>
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Important:</strong> Please save this Recruiter ID safely. You'll need it for future reference and support.
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