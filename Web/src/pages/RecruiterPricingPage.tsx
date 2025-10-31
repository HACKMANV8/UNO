import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Zap, 
  Building2, 
  CheckCircle, 
  Star,
  BarChart3,
  Globe,
  Headphones,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PRICING_CONFIG } from '@/config/pricing';
import { useAuth } from '@/hooks/useAuth';

const RecruiterPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const recruiterPlans = PRICING_CONFIG.recruiterPlans;
  const enterprisePlan = recruiterPlans[0]; // Only one plan for recruiters

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Navigate to checkout/payment page
    navigate(`/checkout?plan=${planId}`);
  };

  const enterpriseFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Blockchain Verification',
      description: 'Verify candidate credentials with 100% authenticity using our blockchain-powered system'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your hiring pipeline, candidate quality, and recruitment ROI'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Enable your entire recruiting team to collaborate seamlessly with role-based access controls'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI-Powered Matching',
      description: 'Find the perfect candidates faster with our intelligent matching algorithms'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'API Integration',
      description: 'Seamlessly integrate with your existing ATS and HR systems via our comprehensive API'
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: 'Dedicated Support',
      description: '24/7 enterprise support with a dedicated account manager for your success'
    }
  ];

  const companyLogos = [
    { name: 'TechCorp', logo: '🏢' },
    { name: 'StartupXYZ', logo: '🚀' },
    { name: 'Enterprise Ltd', logo: '🏛️' },
    { name: 'Innovation Co', logo: '💡' },
    { name: 'Global Solutions', logo: '🌐' },
    { name: 'Future Tech', logo: '⚡' }
  ];

  const testimonials = [
    {
      name: 'Jennifer Smith',
      role: 'Head of Talent Acquisition',
      company: 'TechCorp',
      content: 'Kriti transformed our hiring process. The credential verification feature alone saved us weeks of background checks.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Recruiting Director',
      company: 'StartupXYZ',
      content: 'The ROI was immediate. We reduced time-to-hire by 40% and improved candidate quality significantly.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Sarah Johnson',
      role: 'VP of Human Resources',
      company: 'Enterprise Ltd',
      content: 'The best investment we made this year. Our entire recruiting team loves the collaborative features.',
      rating: 5,
      avatar: '👩‍💻'
    }
  ];

  const stats = [
    { label: 'Companies Using Kriti', value: '500+', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Verified Candidates', value: '50K+', icon: <Users className="h-5 w-5" /> },
    { label: 'Average Time Saved', value: '40%', icon: <Zap className="h-5 w-5" /> },
    { label: 'Customer Satisfaction', value: '98%', icon: <Award className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Already have an account?
              </span>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-purple-600 mb-6">
              <Building2 className="h-4 w-4" />
              Enterprise Solution
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionize Your
              <span className="text-purple-600"> Hiring Process</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The only recruitment platform you need. Verify credentials with blockchain technology, 
              find top talent with AI matching, and streamline your entire hiring workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => handleSelectPlan('recruiter-yearly')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/demo')}
              >
                Schedule Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                    {stat.icon}
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Trusted by Leading Companies
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400 text-lg">
                <span className="text-2xl">{company.logo}</span>
                <span className="font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            One comprehensive plan with everything you need to hire the best talent
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <PricingCard
              plan={enterprisePlan}
              onSelectPlan={handleSelectPlan}
              userType="recruiter"
              isCurrentPlan={false}
            />
          </div>
        </div>

        {/* Enterprise Benefits */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-center mb-8">Everything You Need to Scale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              See how companies are transforming their hiring with Kriti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the blockchain verification work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our blockchain technology creates immutable records of candidate credentials. When a student 
                  adds a credential, it's verified by the issuing institution and stored on the blockchain, 
                  ensuring 100% authenticity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I integrate Kriti with our existing ATS?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Our Enterprise plan includes comprehensive API access and pre-built integrations 
                  with popular ATS platforms. Our technical team will help you set up the integration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What kind of support do you provide?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enterprise customers get 24/7 priority support, a dedicated account manager, 
                  onboarding assistance, and regular check-ins to ensure you're maximizing your ROI.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial available?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We offer a 14-day free trial with full access to all Enterprise features. 
                  No credit card required to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of companies already using Kriti to find and verify top talent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleSelectPlan('recruiter-yearly')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/demo')}
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-purple-200 mt-4">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterPricingPage;