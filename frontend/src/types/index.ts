export type Role = 'admin' | 'approver' | 'editor' | 'viewer';
export type ProductStatus = 'draft' | 'pending_approval' | 'approved';

export interface Business {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  business: Business | null;
  is_active: boolean;
  date_joined: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  status: ProductStatus;
  business_name: string;
  created_by: User | null;
  approved_by: User | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  business_name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  password: string;
}

export interface UpdateUserData {
  role?: Role;
  is_active?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: string;
}

export interface ProductFilters {
  status?: ProductStatus;
  search?: string;
}

export interface PublicProductFilters {
  search?: string;
  min_price?: string;
  max_price?: string;
}
