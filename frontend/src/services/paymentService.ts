// Payment service module
// Ensure this file is treated as a module
export {};

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  name: string;
  last_four?: string;
  exp_month?: number;
  exp_year?: number;
}

// This file is a module

export interface PricingData {
  pro_monthly: { amount: number; currency: string };
  pro_yearly: { amount: number; currency: string };
  enterprise_monthly: { amount: number; currency: string };
  enterprise_yearly: { amount: number; currency: string };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Mock payment service implementation
const paymentService = {
  getPricing: (): PricingData => ({
    pro_monthly: { amount: 299000, currency: 'VND' },
    pro_yearly: { amount: 2990000, currency: 'VND' },
    enterprise_monthly: { amount: 999000, currency: 'VND' },
    enterprise_yearly: { amount: 9990000, currency: 'VND' }
  }),

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    // Mock data for now
    return [
      {
        id: '1',
        type: 'credit_card',
        name: 'Visa ending in 1234',
        last_four: '1234',
        exp_month: 12,
        exp_year: 2025
      }
    ];
  },

  processPayment: async (
    planType: string,
    paymentMethodId: string,
    amount: number
  ): Promise<PaymentResult> => {
    // Mock payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}`
        });
      }, 2000);
    });
  },

  createMoMoPayment: async (paymentRequest: any): Promise<PaymentResult> => {
    return { success: true, transactionId: `momo_${Date.now()}` };
  },

  createZaloPayPayment: async (paymentRequest: any): Promise<PaymentResult> => {
    return { success: true, transactionId: `zalo_${Date.now()}` };
  },

  createVNPayPayment: async (paymentRequest: any): Promise<PaymentResult> => {
    return { success: true, transactionId: `vnpay_${Date.now()}` };
  },

  createPayment: async (paymentRequest: any, method: PaymentMethod): Promise<PaymentResult> => {
    return { success: true, transactionId: `pay_${Date.now()}` };
  },

  formatPrice: (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  }
};

export default paymentService;

// This file is a module
