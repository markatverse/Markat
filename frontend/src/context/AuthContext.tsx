"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
const API_URL = getApiUrl();

type User = {
  id?: string;
  markatId?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'buyer' | 'business' | 'elite' | 'super_admin' | 'catalog_admin' | 'onboarding_admin' | 'support_admin' | 'CONSUMER' | 'SELLER' | 'ADMIN';
  status?: 'active' | 'suspended';
  business?: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  allUsers: User[];
  updateUserRole: (id: string, role: User['role']) => void;
  deleteUser: (id: string) => void;
  addUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Instantly load from cache to prevent loading screen flash
    const cached = localStorage.getItem('user_cache');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsLoading(false);
      } catch {}
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
          }
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const userData = {
          id: data.id,
          markatId: data.markatId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role?.toLowerCase() as User['role'],
          status: 'active' as const,
          business: data.business,
        };
        setUser(userData);
        localStorage.setItem('user_cache', JSON.stringify(userData));
      })
      .catch((e) => {
        console.warn('Auth verification failed:', e.message || e);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch all users for admin panels
  useEffect(() => {
    if (user && user.role.includes('admin')) {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllUsers(data);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const login = (userData: User, token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user_cache', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    setUser(null);
    window.location.replace('/');
  };

  const updateUserRole = async (id: string, role: User['role']) => {
    // Optimistic update
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, role } : null);
    }
    
    // Persist to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role })
      });
    } catch (e) {
      console.error('Failed to update user role on server', e);
    }
  };

  const deleteUser = (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) {
      logout();
    }
  };

  const addUser = (newUser: User) => {
    setAllUsers(prev => [...prev, { ...newUser, id: `u${Date.now()}`, status: 'active' }]);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, allUsers, updateUserRole, deleteUser, addUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
