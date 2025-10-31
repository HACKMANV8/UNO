import React from 'react';
import SubscriptionDashboard from '@/components/subscription/SubscriptionDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SubscriptionDashboard userType={user.role === 'recruiter' ? 'recruiter' : 'student'} />
    </div>
  );
};

export default SubscriptionPage;