import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    } else {
      // Redirect to signup selection page
      navigate('/signup/select');
    }
  }, [isLoggedIn, navigate]);

  return null; // This component just redirects
}
