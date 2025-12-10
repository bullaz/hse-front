import type { AxiosInstance } from 'axios';

export interface AuthContextType {
  initializeAuth: () => Promise<void>;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  axiosInstance: AxiosInstance;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}