import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Shield, Users, Sparkles, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingComparison, FeatureComparisonTable } from '@/components/pricing/PricingCard';
import { PRICING_CONFIG, PricingPlan, calculateYearlySavings } from '@/config/pricing';
import { useAuth } from '@/hooks/useAuth';

const StudentPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const studentPlans = PRICING_CONFIG.studentPlans;
  const monthlyPlan = studentPlans.find(p => p.period === 'monthly');
  const yearlyPlan = studentPlans.find(p => p.period === 'yearly');
  const savings = monthlyPlan && yearlyPlan 
    ? calculateYearlySavings(monthlyPlan.price, yearlyPlan.price)
    : 0;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = studentPlans.find(p => p.id === planId);
    
    if (plan?.period === 'free') {
      // Handle free plan signup
      if (!user) {
        navigate('/signup/student');
      } else {
        // User is already logged in, redirect to dashboard
        navigate('/student/dashboard');
      }
    } else {
      // Navigate to checkout/payment page
      navigate(`/checkout?plan=${planId}`);
    }
  };

  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'AI-Powered Tools',
      description: 'Get intelligent resume suggestions and career guidance powered by advanced AI'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and blockchain verification'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Trusted by Students',
      description: 'Join thousands of students who have landed their dream jobs with Kriti'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Professional Templates',
      description: 'Access to beautifully designed resume templates created by industry experts'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      company: 'MIT',
      content: 'Kriti helped me land my dream internship at Google. The AI coaching was incredibly helpful!',
      rating: 5
    },
    {
      name: 'Alex Rodriguez',
      role: 'Recent Graduate',
      company: 'Stanford University',
      content: 'The resume templates are amazing and the job tracking feature kept me organized throughout my search.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Student',
      company: 'Harvard Business School',
      content: 'I upgraded to Pro and got 3x more interview calls. The investment paid for itself immediately.',
      rating: 5
    }
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-blue-600 mb-6">
            <Sparkles className="h-4 w-4" />
            Special Launch Pricing
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Supercharge Your Career Journey
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have transformed their career prospects with our 
            AI-powered resume builder, interview prep, and job tracking tools.
          </p>

          {savings > 0 && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <CheckCircle className="h-4 w-4" />
              Save ${savings.toFixed(0)} with yearly plans!
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start free and upgrade as your career grows
          </p>

          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
            <TabsList className="grid w-fit grid-cols-2 mx-auto">
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="table">Compare Features</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-8">
              <PricingComparison
                plans={studentPlans}
                onSelectPlan={handleSelectPlan}
                userType="student"
                currentPlanId={user?.uid ? 'student-free' : undefined}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-8">
              <FeatureComparisonTable
                plans={studentPlans}
                onSelectPlan={handleSelectPlan}
                currentPlanId={user?.uid ? 'student-free' : undefined}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Students Choose Kriti
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              See how Kriti has helped students achieve their career goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
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
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing differences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a money-back guarantee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, 
                  we'll refund your payment in full.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, MasterCard, American Express), 
                  PayPal, and Apple Pay through our secure payment processor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have already transformed their careers with Kriti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleSelectPlan('student-free')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleSelectPlan('student-yearly')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Go Pro - Save ${savings.toFixed(0)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPricingPage;