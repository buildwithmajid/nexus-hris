'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearStoredToken, getStoredToken, setStoredToken } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface Company {
  id: string;
  name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchPersona: (roleName: 'super_admin' | 'hr_admin' | 'finance' | 'staff') => Promise<void>;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_COMPANY: Company = {
  id: 'a0000000-0000-4000-8000-000000000001',
  name: 'PT Nusantara Digital Solusi',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(DEFAULT_COMPANY);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    async function initAuth() {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.auth.me();
        setUser(profile);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setStoredToken(res.accessToken);
      const profile = await api.auth.me();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  /**
   * Persona Switcher: Fitur untuk mengecek tampilan hak akses peran yang berbeda (Preview Role)
   */
  const switchPersona = async (roleName: 'super_admin' | 'hr_admin' | 'finance' | 'staff') => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rawUser = await api.auth.me();

      // Filter hak akses UI sesuai persona yang dipilih
      const permissionsMap: Record<string, string[]> = {
        super_admin: rawUser.permissions,
        hr_admin: [
          'employee.read', 'employee.create', 'employee.update',
          'attendance.read', 'payroll.read', 'payroll.run',
        ],
        finance: [
          'employee.read', 'payroll.read', 'payroll.approve', 'payroll.lock', 'report.read',
        ],
        staff: ['attendance.self', 'leave.request', 'payroll.read'],
      };

      setUser({
        ...rawUser,
        roleName,
        permissions: permissionsMap[roleName] || rawUser.permissions,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.roleName === 'super_admin') return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isLoading,
        login,
        logout,
        switchPersona,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

