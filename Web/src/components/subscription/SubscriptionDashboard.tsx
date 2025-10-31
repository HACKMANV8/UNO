import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Crown,
  RefreshCw,
  Plus,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PricingComparison } from '@/components/pricing/PricingCard';
import { PRICING_CONFIG, getStudentPlanById, getRecruiterPlanById, formatPrice } from '@/config/pricing';
import SubscriptionService, { Subscription, PaymentMethod, Invoice } from '@/services/subscription';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionDashboardProps {
  userType: 'student' | 'recruiter';
}

const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({ userType }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [subData, paymentData, invoiceData] = await Promise.all([
        SubscriptionService.getCurrentSubscription(user.uid),
        SubscriptionService.getPaymentMethods(user.uid),
        SubscriptionService.getInvoices(user.uid)
      ]);
      
      setSubscription(subData);
      setPaymentMethods(paymentData);
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await SubscriptionService.upgradePlan(user.uid, planId);
      await loadSubscriptionData();
      setShowUpgradeDialog(false);
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setIsUpdating(true);
    try {
      await SubscriptionService.cancelSubscription(subscription.id, true);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    setIsUpdating(true);
    try {
      await SubscriptionService.reactivateSubscription(subscription.id);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return getStudentPlanById(subscription.planId) || getRecruiterPlanById(subscription.planId);
  };

  const getAvailablePlans = () => {
    return userType === 'student' ? PRICING_CONFIG.studentPlans : PRICING_CONFIG.recruiterPlans;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading subscription details...</span>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const availablePlans = getAvailablePlans();

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                  <p className="text-sm text-gray-600">{currentPlan.description}</p>
                  <p className="text-lg font-bold mt-2">
                    {formatPrice(currentPlan.price, currentPlan.period)}
                  </p>
                </div>
                <div className="text-right">
                  {subscription && (
                    <div className="text-sm text-gray-600">
                      <div>Billing period:</div>
                      <div className="font-medium">
                        {subscription.currentPeriodStart.toLocaleDateString()} - {subscription.currentPeriodEnd.toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {subscription?.cancelAtPeriodEnd && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be canceled at the end of the current billing period 
                    ({subscription.currentPeriodEnd.toLocaleDateString()}).
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-2"
                      onClick={handleReactivateSubscription}
                      disabled={isUpdating}
                    >
                      Reactivate subscription
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {currentPlan.price === 0 ? 'Upgrade Plan' : 'Change Plan'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Choose Your Plan</DialogTitle>
                      <DialogDescription>
                        Select a new plan to upgrade or change your subscription
                      </DialogDescription>
                    </DialogHeader>
                    <PricingComparison
                      plans={availablePlans}
                      onSelectPlan={handleUpgrade}
                      userType={userType}
                      currentPlanId={subscription?.planId}
                    />
                  </DialogContent>
                </Dialog>

                {currentPlan.price > 0 && !subscription?.cancelAtPeriodEnd && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelSubscription}
                    disabled={isUpdating}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">No active subscription found</p>
              <Button onClick={() => setShowUpgradeDialog(true)}>
                Choose a Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        •••• •••• •••• {method.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        {method.brand.toUpperCase()} • Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              No payment methods on file
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View and download your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : invoice.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              No billing history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDashboard;