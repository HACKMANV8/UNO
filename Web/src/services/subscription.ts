export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  createdAt: Date;
  downloadUrl: string;
}

// Mock subscription service
export class SubscriptionService {
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'sub_123',
          userId,
          planId: 'student-free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }, 500);
    });
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'pm_123',
            brand: 'visa',
            last4: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true
          }
        ]);
      }, 500);
    });
  }

  static async getInvoices(userId: string): Promise<Invoice[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'inv_123',
            amount: 9.99,
            currency: 'usd',
            status: 'paid',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            downloadUrl: '/api/invoices/inv_123/download'
          }
        ]);
      }, 500);
    });
  }

  static async upgradePlan(userId: string, newPlanId: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Upgrading user ${userId} to plan ${newPlanId}`);
        resolve();
      }, 1000);
    });
  }

  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Canceling subscription ${subscriptionId}, cancel at period end: ${cancelAtPeriodEnd}`);
        resolve();
      }, 1000);
    });
  }

  static async reactivateSubscription(subscriptionId: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Reactivating subscription ${subscriptionId}`);
        resolve();
      }, 1000);
    });
  }

  static async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Updating payment method for user ${userId}`);
        resolve();
      }, 1000);
    });
  }
}

// Stripe integration functions (to be implemented)
export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string> {
    // Mock implementation - replace with actual Stripe integration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('pi_mock_payment_intent');
      }, 500);
    });
  }

  static async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  static async createCustomer(email: string, name?: string): Promise<string> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('cus_mock_customer_id');
      }, 500);
    });
  }

  static async createSubscription(customerId: string, priceId: string): Promise<string> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('sub_mock_subscription_id');
      }, 1000);
    });
  }
}

export default SubscriptionService;