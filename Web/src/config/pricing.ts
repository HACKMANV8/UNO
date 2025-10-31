export interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'free' | 'monthly' | 'yearly';
  originalPrice?: number; // For showing discounts
  popular?: boolean;
  features: PricingFeature[];
  buttonText: string;
  stripePriceId?: string; // For Stripe integration
}

export interface PricingConfig {
  studentPlans: PricingPlan[];
  recruiterPlans: PricingPlan[];
}

export const PRICING_CONFIG: PricingConfig = {
  studentPlans: [
    {
      id: 'student-free',
      name: 'Free',
      description: 'Perfect for getting started with your career journey',
      price: 0,
      period: 'free',
      features: [
        { name: '3 Resume Templates', included: true, description: 'Access to Modern Minimalist template' },
        { name: 'Basic Resume Builder', included: true, description: 'Create and edit resumes' },
        { name: 'PDF Export', included: true, description: 'Download your resume as PDF' },
        { name: 'Job Application Tracking', included: true, description: 'Track up to 10 applications' },
        { name: 'Basic Interview Prep', included: true, description: 'Access to common interview questions' },
        { name: 'AI Career Coaching', included: false, description: 'Personalized career guidance' },
        { name: 'Premium Templates', included: false, description: 'Creative Portfolio and more' },
        { name: 'Advanced Analytics', included: false, description: 'Detailed application insights' },
        { name: 'Priority Support', included: false, description: '24/7 customer support' },
        { name: 'Custom Branding', included: false, description: 'Remove Kriti branding' }
      ],
      buttonText: 'Get Started Free'
    },
    {
      id: 'student-monthly',
      name: 'Pro Monthly',
      description: 'Everything you need for an active job search',
      price: 9.99,
      period: 'monthly',
      features: [
        { name: 'All Resume Templates', included: true, description: 'Access to all 3 professional templates' },
        { name: 'Advanced Resume Builder', included: true, description: 'AI-powered suggestions' },
        { name: 'PDF Export', included: true, description: 'Unlimited downloads' },
        { name: 'Unlimited Job Tracking', included: true, description: 'Track unlimited applications' },
        { name: 'AI Interview Prep', included: true, description: 'Personalized mock interviews' },
        { name: 'AI Career Coaching', included: true, description: 'Weekly career guidance sessions' },
        { name: 'Premium Templates', included: true, description: 'Creative Portfolio template' },
        { name: 'Advanced Analytics', included: true, description: 'Application success metrics' },
        { name: 'Priority Support', included: false, description: '24/7 customer support' },
        { name: 'Custom Branding', included: false, description: 'Remove Kriti branding' }
      ],
      buttonText: 'Start Pro Monthly'
    },
    {
      id: 'student-yearly',
      name: 'Pro Yearly',
      description: 'Best value for serious job seekers and career growth',
      price: 99.99,
      period: 'yearly',
      originalPrice: 119.88,
      popular: true,
      features: [
        { name: 'All Resume Templates', included: true, description: 'Access to all 3 professional templates' },
        { name: 'Advanced Resume Builder', included: true, description: 'AI-powered suggestions' },
        { name: 'PDF Export', included: true, description: 'Unlimited downloads' },
        { name: 'Unlimited Job Tracking', included: true, description: 'Track unlimited applications' },
        { name: 'AI Interview Prep', included: true, description: 'Personalized mock interviews' },
        { name: 'AI Career Coaching', included: true, description: 'Daily career guidance sessions' },
        { name: 'Premium Templates', included: true, description: 'Creative Portfolio template' },
        { name: 'Advanced Analytics', included: true, description: 'Detailed insights and reports' },
        { name: 'Priority Support', included: true, description: '24/7 premium customer support' },
        { name: 'Custom Branding', included: true, description: 'White-label experience' }
      ],
      buttonText: 'Start Pro Yearly'
    }
  ],
  recruiterPlans: [
    {
      id: 'recruiter-yearly',
      name: 'Enterprise Yearly',
      description: 'Comprehensive hiring platform for modern recruiters',
      price: 299.99,
      period: 'yearly',
      originalPrice: 360.00,
      popular: true,
      features: [
        { name: 'Candidate Verification System', included: true, description: 'Blockchain-powered credential verification' },
        { name: 'Advanced Search & Filters', included: true, description: 'Find the perfect candidates quickly' },
        { name: 'Bulk Actions', included: true, description: 'Manage multiple candidates efficiently' },
        { name: 'Application Analytics', included: true, description: 'Detailed hiring pipeline insights' },
        { name: 'Custom Hiring Workflows', included: true, description: 'Tailor processes to your needs' },
        { name: 'Team Collaboration', included: true, description: 'Multi-recruiter account access' },
        { name: 'API Access', included: true, description: 'Integrate with your existing systems' },
        { name: 'White-label Solution', included: true, description: 'Custom branding options' },
        { name: 'Dedicated Account Manager', included: true, description: 'Personal success manager' },
        { name: 'Priority Support', included: true, description: '24/7 enterprise support' }
      ],
      buttonText: 'Start Enterprise Plan'
    }
  ]
};

export const getStudentPlanById = (planId: string): PricingPlan | undefined => {
  return PRICING_CONFIG.studentPlans.find(plan => plan.id === planId);
};

export const getRecruiterPlanById = (planId: string): PricingPlan | undefined => {
  return PRICING_CONFIG.recruiterPlans.find(plan => plan.id === planId);
};

export const formatPrice = (price: number, period: string): string => {
  if (price === 0) return 'Free';
  if (period === 'yearly') return `$${price.toFixed(0)}/year`;
  return `$${price.toFixed(2)}/month`;
};

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyEquivalent = monthlyPrice * 12;
  return yearlyEquivalent - yearlyPrice;
};