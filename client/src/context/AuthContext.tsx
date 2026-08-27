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
    const wasAdmin = user?.role === 'admin' || window.location.pathname.startsWith('/admin');
    setUser(null);
    setToken(null);
    localStorage.removeItem('frametrail_user');
    localStorage.removeItem('frametrail_token');
    localStorage.removeItem('frametrail_active_admin_session_id');
    sessionStorage.removeItem('frametrail_tab_admin_session_id');

    if (wasAdmin) {
      window.location.href = '/admin-login';
    } else {
      window.location.href = '/login';
    }
  };

  const isAdmin = Boolean(isServerOnline && user && user.role === 'admin');
  const isAuthenticated = Boolean(isServerOnline && user && token);

  // 🔒 SINGLE CONCURRENT ACTIVE ADMIN SESSION LOCK (1 Active Tab Limit)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Retrieve or create unique Tab ID for THIS specific tab
    let myTabId = sessionStorage.getItem('frametrail_tab_admin_session_id');
    if (!myTabId) {
      myTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('frametrail_tab_admin_session_id', myTabId);
    }

    // Refreshing/mounting this active admin tab re-asserts its active session lock in localStorage
    localStorage.setItem('frametrail_active_admin_session_id', myTabId);

    const checkSessionLock = () => {
      const currentActiveId = localStorage.getItem('frametrail_active_admin_session_id');
      const currentTabId = sessionStorage.getItem('frametrail_tab_admin_session_id');

      if (currentActiveId && currentTabId && currentActiveId !== currentTabId) {
        // Tab session was taken over by another tab -> logout cleanly without native browser alerts
        logout();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'frametrail_active_admin_session_id') {
        checkSessionLock();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // 10-Minute Inactivity Auto-Logout Timer for Admin Security
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
      }, 10 * 60 * 1000); // 10 minutes (600,000 ms)
    };

    // Initial setup on mount
    resetTimer();

    // Listen for user interaction events across the page
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

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
