/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AuthContextType } from './auth.types';

// Create context but don't export its type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const BASE_URL = 'http://localhost:8080';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  
  // Refs for managing refresh state
  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef<((token: string | null) => void)[]>([]);

  // Check initial authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Optional: validate token on startup
        try {
          // You could add a token validation API call here
          // await axios.get(`${BASE_URL}/validate`, {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          setAccessToken(token);
        } catch (error) {
          console.log(error);
          localStorage.removeItem('access_token');
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setAccessToken(null);
    isRefreshingRef.current = false;
    refreshSubscribersRef.current = [];
    
    axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
      .catch(err => console.warn('Logout API call failed:', err));
  }, []);

  // Create axios instance
  const axiosInstance = useRef(axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })).current;

  // Setup interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshingRef.current) {
            // If already refreshing, wait for the new token
            return new Promise((resolve, reject) => {
              refreshSubscribersRef.current.push((token: string | null) => {
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(axiosInstance(originalRequest));
                } else {
                  reject(new Error('Authentication failed'));
                }
              });
            });
          }

          originalRequest._retry = true;
          isRefreshingRef.current = true;

          try {
            const response = await axios.post(
              `${BASE_URL}/refresh_token`,
              {},
              { withCredentials: true }
            );

            const newToken = response.data.access_token;
            localStorage.setItem('access_token', newToken);
            setAccessToken(newToken);
            
            // Notify all waiting requests
            refreshSubscribersRef.current.forEach(callback => callback(newToken));
            refreshSubscribersRef.current = [];
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Notify all waiting requests of failure
            refreshSubscribersRef.current.forEach(callback => callback(null));
            refreshSubscribersRef.current = [];
            logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshingRef.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosInstance, logout]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/signin`, {
        username,
        password,
      });

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }
      
      localStorage.setItem('access_token', access_token);
      setAccessToken(access_token);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
    axiosInstance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook - this is allowed because it's a React hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};