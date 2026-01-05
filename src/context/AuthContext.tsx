/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import type { AuthContextType, AuthProviderProps } from './auth.types';
import { BACKEND_SERVER_URL } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = BACKEND_SERVER_URL;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isRefreshingRef = useRef(false);
  const refreshSubscribersRef = useRef<((token: string | null) => void)[]>([]);
  const axiosInstance = useRef(axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }));


  const updateToken = useCallback((token: string | null) => {
    if (token) {
      //sessionStorage.setItem('access_token', token);
      setAccessToken(token);
    } else {
      sessionStorage.removeItem('access_token');
      setAccessToken(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      updateToken(null);
      isRefreshingRef.current = false;
      refreshSubscribersRef.current = [];
    }
  }, [updateToken]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    console.log("Refreshing token...");
    if (isRefreshingRef.current) {
      return new Promise((resolve) => {
        refreshSubscribersRef.current.push((token: string | null) => {
          resolve(token);
        });
      });
    }

    isRefreshingRef.current = true;

    try {
      console.log('before calling refresh api');

      const response = await axios.post(
        `${BASE_URL}/refresh_token`,
        {},
        { withCredentials: true }
      );

      console.log('refresh response',response);

      const newToken = response.data.access_token;
      if (!newToken) {
        throw new Error('No access token received from refresh');
      }

      updateToken(newToken);

      // Notify all queued requests
      refreshSubscribersRef.current.forEach(callback => callback(newToken));
      refreshSubscribersRef.current = [];

      return newToken;
    } catch (error) {
      console.log('Token refresh failed:', error);

      // Notify all queued requests of failure
      refreshSubscribersRef.current.forEach(callback => callback(null));
      refreshSubscribersRef.current = [];

      await logout();
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout, updateToken]);

  // INITIALIZATION OF AUTHENTICATION STATE
  const initializeAuth = useCallback(async () => {
    console.log('Initializing auth state...');
    const storedToken = sessionStorage.getItem('access_token');
    //console.log('session token:', storedToken);

    if (storedToken) {
      try {
        const response = await axios.post(`${BASE_URL}/verify_token`, {}, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        console.log("token state",response.data);
        if (!response.data.token_state) {
          throw new Error('Stored token is invalid');
        }
        setAccessToken(storedToken);
      } catch (error) {
        console.log('Token validation failed:', error);
        await refreshToken();
      }
    } else {
      await refreshToken();
    }

  }, [refreshToken]);

  // useEffect(() => {
  //   console.log('loading state at authprovider render', isLoading);
  // }, [isLoading]);


  useEffect(() => {
    const instance = axiosInstance.current;

    const requestInterceptor = instance.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
          //config.withCredentials = true;
        }
        return config;
      },
      (error) => {Promise.reject(error)}
    );

    const responseInterceptor = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip if already retried or not an auth error
        if (!error.response ||
          (error.response.status !== 401 && error.response.status !== 403) ||
          originalRequest._retry) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } else {
            return Promise.reject(new Error('Authentication failed'));
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    );

    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]);


  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/signin`, {
        username,
        password,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('No access token received');
      }

      updateToken(access_token);
    } catch (error) {
      console.log('Login failed:', error);
      throw error;
    } finally {
      //setIsLoading);
    }
  }, [updateToken]);

  const value: AuthContextType = {
    initializeAuth,
    accessToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
    axiosInstance: axiosInstance.current,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};