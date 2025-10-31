import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, User, Mail, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/firebaseAuthStore';

export default function FirebaseStudentSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    aadhaarNumber: '',
  });
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [kritiId, setKritiId] = useState('');
  
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.aadhaarNumber) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    // Generate and send OTP (mock implementation)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    // In real implementation, send OTP via SMS
    console.log(`OTP sent to ${formData.phone}: ${mockOtp}`);
    alert(`Mock OTP for testing: ${mockOtp}`); // Remove this in production
    
    setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp !== generatedOtp) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    try {
      // Create Firebase user after OTP verification
      const result = await signup({
        ...formData,
        role: 'student'
      });

      setKritiId(result.kritiId);
      setStep(3);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleComplete = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-primary/20">
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
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'Student Registration'}
            {step === 2 && 'Verify Phone Number'}
            {step === 3 && 'Registration Complete'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Create your student account'}
            {step === 2 && `Enter the OTP sent to ${formData.phone}`}
            {step === 3 && 'Welcome to Kriti HireForge!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
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
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="premium" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit verification code to
                </p>
                <p className="font-medium">{formData.phone}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="premium" 
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify & Create Account
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Edit Phone Number
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="mx-auto p-4 rounded-full bg-green-500/10 w-fit">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-500">Account Created Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  Your unique Kriti ID has been generated
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Your Kriti ID</p>
                <p className="text-xl font-bold text-primary">{kritiId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save this ID - you'll need it for credential verification
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={handleComplete}
                >
                  Continue to Login
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Please check your email for verification instructions
                </p>
              </div>
            </div>
          )}

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