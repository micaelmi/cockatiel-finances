import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Token getter — set by the AuthProvider to supply Clerk's getToken()
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attaches Clerk JWT as Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    if (tokenGetter) {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || error.message;
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', message);
        console.error('API Error Details:', error.response.data);
      }
      throw new Error(message);
    } else if (error.request) {
      if (process.env.NODE_ENV === 'development') console.error('Network Error:', error.message);
      throw new Error('Network error. Please check your connection.');
    } else {
      if (process.env.NODE_ENV === 'development') console.error('Error:', error.message);
      throw error;
    }
  }
);
