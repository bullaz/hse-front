import type { AxiosInstance } from 'axios';

export interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Add this
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  axiosInstance: AxiosInstance;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}