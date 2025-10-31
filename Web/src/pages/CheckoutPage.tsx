import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStudentPlanById, getRecruiterPlanById, PricingPlan, formatPrice } from '@/config/pricing';
import { useAuth } from '@/hooks/useAuth';

interface PaymentForm {
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    email: user?.email || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const plan = getStudentPlanById(planId) || getRecruiterPlanById(planId);
      setSelectedPlan(plan || null);
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    if (field === 'cardNumber') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    if (field === 'expiryDate') {
      // Format expiry date as MM/YY
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    if (field === 'cvv') {
      // Limit CVV to 4 digits
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof PaymentForm['billingAddress'], value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment success
      console.log('Processing payment for plan:', selectedPlan.id);
      console.log('Payment form:', paymentForm);
      
      // In a real implementation, you would:
      // 1. Create Stripe PaymentIntent
      // 2. Confirm the payment
      // 3. Update user subscription in your database
      // 4. Send confirmation email
      
      // For now, simulate success and redirect
      if (selectedPlan.id.includes('student')) {
        navigate('/student/dashboard?payment=success');
      } else {
        navigate('/recruiter/dashboard?payment=success');
      }
    } catch (err) {
      setError('Payment failed. Please check your information and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTax = (price: number) => {
    return price * 0.08; // 8% tax rate
  };

  const calculateTotal = (price: number) => {
    return price + calculateTax(price);
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
          <p className="text-gray-600 mb-6">The requested plan could not be found.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Your payment information is encrypted and secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  {/* Card Information */}
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={paymentForm.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      required
                    />
                  </div>

                  <Separator />

                  {/* Billing Address */}
                  <div>
                    <h4 className="font-medium mb-4">Billing Address</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main St"
                          value={paymentForm.billingAddress.line1}
                          onChange={(e) => handleAddressChange('line1', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="San Francisco"
                            value={paymentForm.billingAddress.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            placeholder="CA"
                            value={paymentForm.billingAddress.state}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="94102"
                          value={paymentForm.billingAddress.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Complete Payment`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Secure Payment</h4>
                    <p className="text-sm text-gray-600">
                      Your payment information is encrypted using industry-standard SSL technology. 
                      We never store your credit card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedPlan.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                  {selectedPlan.popular && (
                    <Badge>Most Popular</Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedPlan.price, selectedPlan.period)}</span>
                  </div>
                  
                  {selectedPlan.price > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax</span>
                        <span>${calculateTax(selectedPlan.price).toFixed(2)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>${calculateTotal(selectedPlan.price).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {selectedPlan.originalPrice && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        You save ${(selectedPlan.originalPrice - selectedPlan.price).toFixed(2)}!
                      </span>
                    </div>
                  </div>
                )}

                {/* Plan Features */}
                <div>
                  <h4 className="font-medium mb-3">What's included:</h4>
                  <div className="space-y-2">
                    {selectedPlan.features
                      .filter(feature => feature.included)
                      .slice(0, 5)
                      .map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature.name}</span>
                      </div>
                    ))}
                    {selectedPlan.features.filter(f => f.included).length > 5 && (
                      <p className="text-sm text-gray-600">
                        +{selectedPlan.features.filter(f => f.included).length - 5} more features
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money Back Guarantee */}
            {selectedPlan.price > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-2">30-Day Money-Back Guarantee</h4>
                    <p className="text-sm text-gray-600">
                      Not satisfied? Get a full refund within 30 days, no questions asked.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;