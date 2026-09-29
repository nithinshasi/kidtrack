import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

interface AuthUser {
  userId: number;
  name: string;
  userType: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (phone: string, otp: string, userType: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('kidtrack_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (phone: string, otp: string, userType: string) => {
    const { data } = await authApi.verifyOtp(phone, otp, userType);
    const authUser: AuthUser = {
      userId: data.userId,
      name: data.name,
      userType: data.userType,
      token: data.token,
    };
    localStorage.setItem('kidtrack_token', data.token);
    localStorage.setItem('kidtrack_user', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kidtrack_token');
    localStorage.removeItem('kidtrack_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
