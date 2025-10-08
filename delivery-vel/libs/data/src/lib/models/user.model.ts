import { UserRole } from '../enums/user-role.enum';
import { Address } from './address.model';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  delivery: {
    defaultAddressId?: string;
    instructions?: string;
  };
  payment: {
    defaultMethodId?: string;
  };
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
    allergies: string[];
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  addresses: Address[];
  preferences: UserPreferences;
  stats?: UserStats;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  lastOrderDate?: Date;
  loyaltyPoints: number;
}