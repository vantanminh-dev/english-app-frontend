import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  token: string;
  vocabularyLists?: any[];
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Helper function to check if code is running on the client
const isClient = typeof window !== 'undefined';

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// API instance with auth header
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
authApi.interceptors.request.use(
  (config) => {
    if (isClient) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth functions
export const authService = {
  // Register a new user
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await authApi.post<AuthResponse>('/auth/register', credentials);
    const user = response.data;
    
    // Save auth data (only on client)
    if (isClient) {
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    return user;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await authApi.post<AuthResponse>('/auth/login', credentials);
    const user = response.data;
    
    // Save auth data (only on client)
    if (isClient) {
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    return user;
  },

  // Logout user
  logout: (): void => {
    if (isClient) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (!isClient) return null;
    
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await authApi.get<User>('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<RegisterCredentials>): Promise<User> => {
    const response = await authApi.put<AuthResponse>('/auth/me', data);
    const user = response.data;
    
    // Update stored user data (only on client)
    if (isClient) {
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    return user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (!isClient) return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get auth token
  getToken: (): string | null => {
    if (!isClient) return null;
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService; 