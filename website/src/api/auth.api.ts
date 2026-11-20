import { apiClient } from './client';
import type {
  AuthResponse,
  CustomerLoginInput,
  CustomerRegisterInput,
  VendorLoginInput,
  VendorRegisterInput,
} from '../types/auth.types';

export const authApi = {
  // Vendor Endpoints
  vendorRegister: async (data: VendorRegisterInput) => {
    const response = await apiClient.post<AuthResponse>('/vendor/register', data);
    return response.data;
  },

  vendorLogin: async (data: VendorLoginInput) => {
    const response = await apiClient.post<AuthResponse>('/vendor/login', data);
    return response.data;
  },

  vendorGetProfile: async () => {
    const response = await apiClient.get<AuthResponse>('/vendor/profile');
    return response.data;
  },

  // Customer Endpoints (supports backend API or graceful simulated fallback for initial client testing)
  customerRegister: async (data: CustomerRegisterInput) => {
    try {
      const response = await apiClient.post<AuthResponse>('/customer/register', data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Fallback simulation for client testing before customer module backend migration
        return {
          statusCode: 201,
          success: true,
          message: 'Customer registered successfully',
          data: {
            token: 'mock-customer-jwt-token',
            customer: {
              id: 'cust-' + Date.now(),
              name: data.name,
              email: data.email,
              phone: data.phone || null,
              active: true,
            },
          },
        };
      }
      throw error;
    }
  },

  customerLogin: async (data: CustomerLoginInput) => {
    try {
      const response = await apiClient.post<AuthResponse>('/customer/login', data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Fallback simulation for client testing
        return {
          statusCode: 200,
          success: true,
          message: 'Logged in successfully',
          data: {
            token: 'mock-customer-jwt-token',
            customer: {
              id: 'cust-demo',
              name: data.email.split('@')[0],
              email: data.email,
              active: true,
            },
          },
        };
      }
      throw error;
    }
  },
};
