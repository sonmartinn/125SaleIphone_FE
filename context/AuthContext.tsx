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
  token: string | null;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string }>
  verifyEmail: (
    email: string,
    code: string
  ) => Promise<{ error?: string }>
  resendCode: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>;

  fetchUser: () => Promise<void>;
}

interface ProfileResponse {
  data: IUser;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto login nếu có token
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setIsLoading(false);
      setToken(null);
      return;
    }

    setToken(storedToken);

    getProfileApi()
      .then((res: ProfileResponse) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      await registerApi({
        UserName: name,         
        Email: email,
        Password: password,
        Password_confirmation: password,
      })

      return {}
    } catch (err: any) {
      return {
        error: err.message || 'Đăng ký thất bại',
      }
    }
  }

  const verifyEmail = async (email: string, code: string) => {
    try {
      await verifyEmailApi({
        Email: email,
        Code: code,
      })

      return { error: null }
    } catch (err: any) {
      return {
        error: err.message || 'Xác thực email thất bại',
      }
    }
  }

  const resendCode = async (email: string) => {
    await resendCodeApi({ Email: email });
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await loginApi({
        Email: email,
        Password: password,
      });

      localStorage.setItem('access_token', res.access_token);
      setToken(res.access_token);

      const profileRes: ProfileResponse = await getProfileApi();
      setUser(profileRes.data);

      return {};
    } catch (err: any) {
      return {
        error: err.message || 'Đăng nhập thất bại',
      };
    }
  };

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setToken(null);
  };

  const fetchUser = async () => {
    const storedToken = localStorage.getItem('access_token');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      setToken(storedToken);

      const res: ProfileResponse = await getProfileApi();
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('access_token');
      setUser(null);
      setToken(null);
      throw err;
    }
  };


return (
  <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        register,
        verifyEmail,
        resendCode,
        login,
        logout,
        fetchUser,
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
