export const UserRole = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  PUBLIC: 'PUBLIC',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING'
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CARD: 'CARD',
  MOBILE_MONEY: 'MOBILE_MONEY'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface Admin {
  id: string;
  surname: string;
  otherNames: string;
  gender: Gender;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  surname: string;
  otherNames: string;
  phone: string;
  gender: Gender;
  studentId?: string | null;
  staffId?: string | null;
  residence?: boolean;
  hallOfResidence?: string | null;
  isActive: boolean;
  _count: {
    subscriptions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  targetRole: UserRole;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  plan?: Plan;
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paystackReference?: string | null;
  paymentStatus: PaymentStatus;
  metadata?: any;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: {
    user: User;
    plan: Plan;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    admin: Admin;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  count?: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
