export const UserRole = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  PUBLIC: 'PUBLIC',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  targetRole: UserRole;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  studentId?: string;
  staffId?: string;
  residence?: boolean;
  hallOfResidence?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface StudentSignupInput {
  studentId: string;
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  residence?: boolean;
  hallOfResidence?: string;
}

export interface StaffSignupInput {
  staffId: string;
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
}

export interface PublicSignupInput {
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
}

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CARD: 'CARD',
  MOBILE_MONEY: 'MOBILE_MONEY',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface Transaction {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paystackReference?: string;
  paymentStatus: PaymentStatus;
  metadata?: any;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    plan: {
      id: string;
      name: string;
      price: number;
      duration: number;
    };
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
  transactions: Transaction[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
