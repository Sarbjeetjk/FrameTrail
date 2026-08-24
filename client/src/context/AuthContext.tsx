import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isServerOnline: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  checkServerHealth: () => Promise<boolean>;
  updateProfile: (data: { name?: string; email?: string; avatar?: string; password?: string }) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const savedUser = localStorage.getItem('frametrail_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('frametrail_token');
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);

  const checkServerHealth = async (): Promise<boolean> => {
    try {
      if (token) {
        const res = await AuthService.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('frametrail_user', JSON.stringify(res.data.user));
          setIsServerOnline(true);
          return true;
        }
      }
      setIsServerOnline(true);
      return true;
    } catch (error: any) {
      if (!error.response) {
        // Network error - Backend Server is Down / Stopped!
        setIsServerOnline(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('frametrail_user');
        localStorage.removeItem('frametrail_token');
        return false;
      } else {
        // Invalid token 401
        setIsServerOnline(true);
        logout();
        return false;
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkServerHealth();
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setIsServerOnline(true);
      localStorage.setItem('frametrail_user', JSON.stringify(res.data.user));
      localStorage.setItem('frametrail_token', res.data.token);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await AuthService.register(name, email, password, role);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setIsServerOnline(true);
      localStorage.setItem('frametrail_user', JSON.stringify(res.data.user));
      localStorage.setItem('frametrail_token', res.data.token);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; avatar?: string; password?: string }) => {
    const res = await AuthService.updateProfile(data);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('frametrail_user', JSON.stringify(res.data.user));
    } else {
      throw new Error(res.message || 'Failed to update profile');
    }
  };

  const resetPassword = async (email: string, password: string) => {
    const res = await AuthService.resetPassword(email, password);
    if (!res.success) {
      throw new Error(res.message || 'Failed to reset password');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('frametrail_user');
    localStorage.removeItem('frametrail_token');
  };

  const isAdmin = Boolean(isServerOnline && user && user.role === 'admin');
  const isAuthenticated = Boolean(isServerOnline && user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isServerOnline,
        loading,
        login,
        register,
        logout,
        checkServerHealth,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
