import React from 'react';
import { Check, X, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingPlan, formatPrice, calculateYearlySavings } from '@/config/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (planId: string) => void;
  userType: 'student' | 'recruiter';
  isCurrentPlan?: boolean;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  onSelectPlan, 
  userType,
  isCurrentPlan = false,
  className = ''
}) => {
  const monthlyPlan = userType === 'student' ? { price: 9.99 } : null;
  const savings = plan.period === 'yearly' && monthlyPlan 
    ? calculateYearlySavings(monthlyPlan.price, plan.price) 
    : 0;

  return (
    <Card 
      className={`relative transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        plan.popular ? 'border-primary shadow-md scale-105' : ''
      } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''} ${className}`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-green-500 text-white border-green-500">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          {plan.name.includes('Pro') && <Crown className="h-4 w-4 text-yellow-500" />}
        </div>
        
        <CardDescription className="text-sm mb-4">
          {plan.description}
        </CardDescription>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold">
              {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(plan.period === 'yearly' ? 0 : 2)}`}
            </span>
            {plan.price > 0 && (
              <span className="text-muted-foreground">
                /{plan.period === 'yearly' ? 'year' : 'month'}
              </span>
            )}
          </div>

          {/* Original Price & Savings */}
          {plan.originalPrice && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(plan.originalPrice, plan.period)}
              </div>
              {savings > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${savings.toFixed(0)} per year!
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features List */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {feature.included ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {feature.name}
                </span>
                {feature.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onSelectPlan(plan.id)}
          variant={plan.popular ? 'default' : 'outline'}
          className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : plan.buttonText}
        </Button>

        {/* Additional Info */}
        {plan.period === 'free' && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            No credit card required
          </p>
        )}
        
        {plan.period === 'yearly' && userType === 'student' && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Billed annually • Cancel anytime
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface PricingComparisonProps {
  plans: PricingPlan[];
  onSelectPlan: (planId: string) => void;
  userType: 'student' | 'recruiter';
  currentPlanId?: string;
}

export const PricingComparison: React.FC<PricingComparisonProps> = ({
  plans,
  onSelectPlan,
  userType,
  currentPlanId
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          onSelectPlan={onSelectPlan}
          userType={userType}
          isCurrentPlan={currentPlanId === plan.id}
        />
      ))}
    </div>
  );
};

interface FeatureComparisonTableProps {
  plans: PricingPlan[];
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
}

export const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  plans,
  onSelectPlan,
  currentPlanId
}) => {
  // Get all unique features across plans
  const allFeatures = Array.from(
    new Set(plans.flatMap(plan => plan.features.map(f => f.name)))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-4 text-left font-semibold">
              Features
            </th>
            {plans.map((plan) => (
              <th key={plan.id} className="border border-gray-200 p-4 text-center">
                <div className="space-y-2">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-lg font-bold">
                    {formatPrice(plan.price, plan.period)}
                  </div>
                  <Button
                    size="sm"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => onSelectPlan(plan.id)}
                    disabled={currentPlanId === plan.id}
                    className="w-full"
                  >
                    {currentPlanId === plan.id ? 'Current' : 'Choose'}
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((featureName, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-200 p-4 font-medium">
                {featureName}
              </td>
              {plans.map((plan) => {
                const feature = plan.features.find(f => f.name === featureName);
                return (
                  <td key={plan.id} className="border border-gray-200 p-4 text-center">
                    {feature?.included ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricingCard;