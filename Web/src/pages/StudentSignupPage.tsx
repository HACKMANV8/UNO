import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, Shield, Phone, CreditCard } from 'lucide-react';

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Aadhaar Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Basic Info State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    aadhaarNumber: '',
    password: ''
  });

  // OTP State
  const [otpData, setOtpData] = useState({
    verificationPhone: '',
    otp: '',
    otpSent: false
  });

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.aadhaarNumber || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return;
    }

    setStep(2);
  };

  const handleSendOTP = async () => {
    if (!otpData.verificationPhone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOtpData(prev => ({ ...prev, otpSent: true }));
      setError('');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpData.otp) {
      setError('Please enter the OTP');
      return;
    }

    if (otpData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Mock API call to verify OTP and complete signup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock: Simulate successful verification
      if (otpData.otp === '123456') {
        // Signup successful
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please login with your credentials.',
            email: formData.email 
          }
        });
      } else {
        setError('Invalid OTP. Please try again. (Use 123456 for demo)');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Student Registration</CardTitle>
            <CardDescription>
              Create your account to start building your professional profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
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
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="10-digit mobile number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Card Number *</Label>
                <Input
                  id="aadhaarNumber"
                  placeholder="12-digit Aadhaar number"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                  maxLength={12}
                  required
                />
              </div>

              <Button type="submit" variant="premium" className="w-full" size="lg">
                Continue to Verification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStep(1)}
            className="mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Aadhaar Verification</CardTitle>
          <CardDescription>
            Two-step verification using your Aadhaar linked mobile number
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpData.otpSent ? (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Aadhaar Number:</strong> {formData.aadhaarNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please enter the mobile number linked with this Aadhaar card
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationPhone">Aadhaar Linked Mobile Number *</Label>
                <Input
                  id="verificationPhone"
                  placeholder="10-digit mobile number"
                  value={otpData.verificationPhone}
                  onChange={(e) => setOtpData(prev => ({ ...prev, verificationPhone: e.target.value }))}
                  maxLength={10}
                  required
                />
              </div>

              <Button 
                onClick={handleSendOTP} 
                variant="premium" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  OTP sent to {otpData.verificationPhone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP *</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={otpData.otp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Demo: Use 123456 as OTP
                </p>
              </div>

              <Button 
                type="submit" 
                variant="premium" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setOtpData(prev => ({ ...prev, otpSent: false, otp: '' }))}
                disabled={loading}
              >
                Resend OTP
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}