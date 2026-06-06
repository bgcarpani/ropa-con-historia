import React, { createContext, useContext, useState } from 'react';
import { Role } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  userId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role') as Role | null;
    const userId = localStorage.getItem('userId');
    return { isAuthenticated: !!token, role, userId };
  });

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.role);
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
    localStorage.setItem('userId', payload.sub);
    setAuth({ isAuthenticated: true, role: data.role, userId: payload.sub });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ isAuthenticated: false, role: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
