'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService, { User } from '@/libs/AuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = AuthService.getAccessToken();
      if (token) {
        try {
          const profile = await AuthService.getProfile(token);
          setUser(profile);
          setIsAuthenticated(true);
        } catch (err) {
          AuthService.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(data);
      AuthService.setTokens(response.accessToken, response.refreshToken);
      const profile = await AuthService.getProfile(response.accessToken);
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.signup(data);
      AuthService.setTokens(response.accessToken, response.refreshToken);
      const profile = await AuthService.getProfile(response.accessToken);
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
