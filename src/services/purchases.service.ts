/**
 * Purchases Service - Test Portal Mobile
 * 
 * Handles payment and purchase-related API calls.
 * Ported from test-portal-client/src/services/purchases.service.ts
 */

import { api } from './api.client';

// Purchased package
export interface PurchasedPackage {
  packageId: string;
  packageName: string;
  packageSlug: string;
  category: string;
  thumbnail: string;
  tests: {
    testId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    duration: number;
    totalMarks: number;
  }[];
  hasTests: boolean;
}

// Purchase record
export interface Purchase {
  packageId?: string;
  amount: number;
  currency: string;
  purchaseDate: string;
  paymentId: string;
}

// Purchased content response
export interface PurchasedContentResponse {
  totalPurchases: number;
  totalSpent: number;
  purchasedPackages: PurchasedPackage[];
  accessibleTestIds: string[];
  purchases: Purchase[];
}

export const purchasesService = {
  // Get all purchased content (packages and tests)
  getPurchasedContent: async (): Promise<PurchasedContentResponse> => {
    const response = await api.get<PurchasedContentResponse>(
      '/payments/purchased/content'
    );
    return response;
  },
};

export default purchasesService;
