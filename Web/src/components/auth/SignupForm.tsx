import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { UserRole } from '@/store/authStore';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadhaarNumber: '',
    role: 'student' as UserRole,
  });
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        aadhaarNumber: formData.aadhaarNumber || undefined,
      });
      // Navigate to home route which will redirect based on role
      navigate('/');
    } catch (err: any) {
      const errorMessage = err?.message;
      
      switch (errorMessage) {
        case 'AUTHORIZATION_REQUIRED':
          setError('Account created! You will receive an email once authorized by our administrators.');
          // Navigate to authorization status page after a delay
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: formData.role } 
            });
          }, 3000);
          break;
        case 'ALREADY_PENDING':
          setError('An account with this email and role is already pending authorization.');
          setTimeout(() => {
            navigate('/authorization-status', { 
              state: { userEmail: formData.email, userRole: formData.role } 
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
          setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
        <Input
          id="aadhaar"
          type="text"
          placeholder="XXXX-XXXX-XXXX"
          value={formData.aadhaarNumber}
          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          disabled={isLoading}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student/Professional</SelectItem>
            <SelectItem value="issuer_staff">Issuer Staff</SelectItem>
            <SelectItem value="issuer_admin">Issuer Admin</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
          </SelectContent>
        </Select>
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
          'Create Account'
        )}
      </Button>
    </form>
  );
}
