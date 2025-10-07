import { apiService } from '@/services/api';
import { authService } from '@/services/authService';
import { AuthTokens } from '@/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  email: string | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    // Set up the callback for auth status changes from API service
    apiService.setAuthStatusChangeCallback((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        // Clear local state when auth status becomes false
        setEmail(null);
        setTokens(null);
      }
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentTokens = authService.getCurrentTokens();
      if (currentTokens) {
        // We have tokens, but we need to validate them
        // For now, we'll assume they're valid and set the state
        // In a production app, you might want to validate with the backend
        setTokens(currentTokens);
        // Load the stored email
        const storedEmail = await apiService.getStoredEmail();
        setEmail(storedEmail);
      } else {
        console.log('No existing tokens found on app start');
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // Clear any invalid tokens
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { email: loggedInEmail, tokens: newTokens } = await authService.login({ email, password });
      setEmail(loggedInEmail);
      setTokens(newTokens);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const { email: registeredEmail, tokens: newTokens } = await authService.register({ email, password, name });
      setEmail(registeredEmail);
      setTokens(newTokens);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      // Only clear local state if logout was successful on backend
      setEmail(null);
      setTokens(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Don't clear local state if logout failed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    email,
    tokens,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!tokens,
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
