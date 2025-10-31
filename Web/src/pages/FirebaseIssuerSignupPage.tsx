import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, GraduationCap, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/firebaseAuthStore';
import { CredentialType } from '@/services/firebase';

const credentialTypeOptions = [
  { id: 'degree', label: 'Degree Certificates', description: 'Bachelor, Master, PhD degrees' },
  { id: 'certificate', label: 'Professional Certificates', description: 'Industry certifications' },
  { id: 'diploma', label: 'Diploma Certificates', description: 'Diploma and advanced diploma' },
  { id: 'skill', label: 'Skill Certifications', description: 'Technical and soft skills' },
  { id: 'experience', label: 'Experience Letters', description: 'Work experience verification' },
];

export default function FirebaseIssuerSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    aadhaarNumber: '',
    institutionName: '',
    institutionType: '',
  });
  const [selectedCredentialTypes, setSelectedCredentialTypes] = useState<CredentialType[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCredentialTypeChange = (credentialType: CredentialType, checked: boolean) => {
    if (checked) {
      setSelectedCredentialTypes(prev => [...prev, credentialType]);
    } else {
      setSelectedCredentialTypes(prev => prev.filter(type => type !== credentialType));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || 
        !formData.aadhaarNumber || !formData.institutionName || !formData.institutionType) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    if (selectedCredentialTypes.length === 0) {
      return;
    }

    try {
      await signup({
        ...formData,
        role: 'issuer_admin',
        allowedCredentialTypes: selectedCredentialTypes
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-4 rounded-full bg-warning/10 w-fit">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl">Application Submitted</CardTitle>
            <CardDescription>
              Your issuer application is under review
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground">
                Your issuer application has been submitted successfully. Our admin team will review your institution details and approve your account within 2-3 business days.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You'll receive an email notification once your account is approved.
              </p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Selected Credential Types:</strong>
              </p>
              <div className="space-y-1">
                {selectedCredentialTypes.map(type => {
                  const option = credentialTypeOptions.find(opt => opt.id === type);
                  return (
                    <p key={type} className="text-xs text-primary">
                      • {option?.label}
                    </p>
                  );
                })}
              </div>
            </div>

            <Button 
              variant="premium" 
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Continue to Login
            </Button>

            <p className="text-xs text-muted-foreground">
              You can try logging in once your account is approved
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card border-primary/20">
        <div className="p-4 pb-0">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
            <Link to="/signup/select" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Issuer Registration</CardTitle>
          <CardDescription>
            Register your institution to issue verified credentials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@university.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    placeholder="1234 5678 9012"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Institution Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Institution Information</h3>
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institution Name</Label>
                <Input
                  id="institutionName"
                  name="institutionName"
                  placeholder="Visvesvaraya Technological University"
                  value={formData.institutionName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('institutionType', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="training_center">Training Center</SelectItem>
                    <SelectItem value="certification_body">Certification Body</SelectItem>
                    <SelectItem value="government">Government Organization</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Credential Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credential Types You Can Issue</h3>
              <p className="text-sm text-muted-foreground">
                Select the types of credentials your institution will be authorized to issue:
              </p>
              
              <div className="space-y-3">
                {credentialTypeOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={option.id}
                      checked={selectedCredentialTypes.includes(option.id as CredentialType)}
                      onCheckedChange={(checked) => 
                        handleCredentialTypeChange(option.id as CredentialType, checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedCredentialTypes.length === 0 && (
                <p className="text-xs text-destructive">
                  Please select at least one credential type
                </p>
              )}
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Your application will be reviewed by our admin team. 
                You'll only be able to issue the credential types you select here.
              </p>
            </div>

            <Button 
              type="submit" 
              variant="premium" 
              className="w-full"
              disabled={isLoading || selectedCredentialTypes.length === 0}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}