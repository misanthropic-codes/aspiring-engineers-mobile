/**
 * Packages Service - Test Portal Mobile
 * 
 * Handles package-related API calls.
 * Ported from test-portal-client/src/services/packages.service.ts
 */

import { api } from './api.client';

// Package interface
export interface Package {
  _id: string;
  title: string;
  description: string;
  packageId: string;
  type: 'test-series' | 'course' | 'bundle';
  status: 'active' | 'inactive' | 'upcoming';
  price: number;
  discountPrice?: number;
  currency: string;
  examTypes: string[];
  subjects: string[];
  thumbnail?: string;
  features: string[];
  validityDays: number;
  totalTests: number;
  totalQuestions: number;
  tests?: {
    _id: string;
    title: string;
    category: string;
    type: string;
    duration: number;
    totalMarks: number;
  }[];
  metadata?: {
    difficulty?: string;
    rating?: number;
    totalStudents?: number;
    language?: string;
    targetYear?: number;
    instructors?: string[];
  };
  purchaseInfo?: {
    isPurchased: boolean;
    purchaseDate: string;
    validUntil: string;
    daysRemaining: number;
  };
  launchDate?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface PackageAccessResponse {
  hasAccess: boolean;
  productId: string;
}

export interface PackagesListResponse {
  success: boolean;
  message: string;
  data: Package[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const packagesService = {
  // Check if user has access to a package
  checkPackageAccess: async (productId: string): Promise<PackageAccessResponse> => {
    const response = await api.get<PackageAccessResponse>(
      `/payments/access/package/${productId}`
    );
    return response;
  },

  // Get package details by packageId
  getPackageDetails: async (packageId: string): Promise<Package> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: Package;
    }>(`/packages/id/${packageId}`);
    return response.data;
  },

  // Get all packages with optional filters
  getPackages: async (filters?: {
    type?: string;
    status?: string;
    examType?: string;
    page?: number;
    limit?: number;
  }): Promise<PackagesListResponse> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.examType) params.append('examType', filters.examType);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/packages?${queryString}` : '/packages';

    const response = await api.get<PackagesListResponse>(url);
    return response;
  },
};

export default packagesService;
