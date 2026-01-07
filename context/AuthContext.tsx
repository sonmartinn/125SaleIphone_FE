'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  registerApi,
  loginApi,
  verifyEmailApi,
  resendCodeApi,
  getProfileApi,
  logoutApi,
} from '@/lib/api';

interface IUser {
  IdUser: string;
  UserName: string;
  Email: string;
  Role: string;
}

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: any) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface ProfileResponse {
  data: IUser;
}

const AuthContext = createContext<AuthContextType | null>(null);
const [user, setUser] = useState<IUser | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto login nếu có token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    getProfileApi()
      .then((res: ProfileResponse) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const register = async (data: any) => {
    await registerApi(data);
  };

  const verifyEmail = async (email: string, code: string) => {
    await verifyEmailApi({ Email: email, Code: code });
  };

  const resendCode = async (email: string) => {
    await resendCodeApi({ Email: email });
  };

  const login = async (email: string, password: string) => {
    const res = await loginApi({ Email: email, Password: password });

    localStorage.setItem('access_token', res.access_token);
    setUser(res.user);
  };

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        verifyEmail,
        resendCode,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
