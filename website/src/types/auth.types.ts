export type UserRole = 'vendor' | 'customer';

export interface VendorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string | null;
  phoneNumber?: string | null;
  phoneCountry?: string | null;
  profilePicture?: string | null;
  profilePictureUrl?: string | null;
  active: boolean;
  createdAt?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  active: boolean;
}

export type AuthUser =
  | (VendorUser & { role: 'vendor' })
  | (CustomerUser & { role: 'customer' });

export interface VendorRegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName?: string;
  phoneNumber?: string;
}

export interface VendorLoginInput {
  email: string;
  password: string;
}

export interface CustomerRegisterInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface CustomerLoginInput {
  email: string;
  password?: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: {
    token: string;
    accessToken?: string;
    vendor?: VendorUser;
    customer?: CustomerUser;
    user?: any;
  };
}
