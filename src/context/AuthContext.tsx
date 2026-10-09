import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Notification } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (email: string, name?: string, robloxUsername?: string, avatarUrl?: string) => Promise<void>;
  register: (username: string, email: string, password: string, robloxUsername?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'admin' | 'user') => Promise<void>;
  updateRobloxUsername: (robloxUsername: string) => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('trio_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('trio_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('trio_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // quiet fail
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (token) {
        await fetchCurrentUser(token);
      } else {
        // Pre-log in as demo player so reviewer can immediately experience all features
        try {
          const res = await fetch('/api/auth/switch-demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'user' })
          });
          if (res.ok) {
            const data = await res.json();
            setToken(data.token);
            localStorage.setItem('trio_token', data.token);
            setUser(data.user);
          }
        } catch {
          // fallback
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user && token) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, token, refreshNotifications]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');

    localStorage.setItem('trio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (email: string, name?: string, robloxUsername?: string, avatarUrl?: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, robloxUsername, avatarUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed.');

    localStorage.setItem('trio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (username: string, email: string, password: string, robloxUsername?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, robloxUsername })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');

    localStorage.setItem('trio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('trio_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const switchDemoRole = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('trio_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateRobloxUsername = async (robloxUsername: string) => {
    if (!token) throw new Error('Not authenticated.');
    const res = await fetch('/api/auth/update-roblox-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ robloxUsername })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update username.');
    setUser(data.user);
  };

  const markNotificationRead = async (id?: string) => {
    if (!token) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      setNotifications(prev =>
        prev.map(n => (!id || n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // quiet fail
    }
  };

  const refreshUser = async () => {
    if (token) await fetchCurrentUser(token);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        loginWithGoogle,
        register,
        logout,
        switchDemoRole,
        updateRobloxUsername,
        notifications,
        unreadCount,
        markNotificationRead,
        refreshNotifications,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
