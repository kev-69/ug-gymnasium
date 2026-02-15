import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Plans API
export const getPlans = (params?: { isActive?: boolean; targetRole?: string }) => {
  return api.get('/plans', { params });
};

export const getPlanById = (id: string) => {
  return api.get(`/plans/${id}`);
};

// Auth API
export const login = (data: { email: string; password: string }) => {
  return api.post('/auth/login', data);
};

export const registerStudent = (data: {
  studentId: string;
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  residence?: boolean;
  hallOfResidence?: string;
}) => {
  return api.post('/auth/signup/student', data);
};

export const registerStaff = (data: {
  staffId: string;
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
}) => {
  return api.post('/auth/signup/staff', data);
};

export const registerPublic = (data: {
  email: string;
  password: string;
  surname: string;
  otherNames: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
}) => {
  return api.post('/auth/signup/public', data);
};

export const logout = () => {
  return api.post('/auth/logout');
};

export const getProfile = () => {
  return api.get('/auth/profile');
};

// Subscriptions API
export const getSubscriptions = () => {
  return api.get('/subscriptions');
};

export const getSubscriptionById = (id: string) => {
  return api.get(`/subscriptions/${id}`);
};

export const createSubscription = (data: { planId: string }) => {
  return api.post('/subscriptions', data);
};

// Transactions API
export const getTransactions = (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return api.get('/transactions', { params });
};

// Payments API
export const initializePayment = (data: { 
  transactionId: string;
  paymentMethod: 'CARD' | 'MOBILE_MONEY';
}) => {
  return api.post('/payments/initialize', data);
};

export const verifyPayment = (reference: string) => {
  return api.get(`/payments/verify/${reference}`);
};

export default api;
