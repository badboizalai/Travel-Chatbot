import React, { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';

// Simple auth state management without context (for compatibility)
let globalUser: User | null = null;
let globalLoading = true;
const subscribers: ((user: User | null, loading: boolean) => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback(globalUser, globalLoading));
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);

  useEffect(() => {
    const callback = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser);
      setLoading(newLoading);
    };
    subscribers.push(callback);
    
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login(username, password);
      localStorage.setItem('token', response.access_token);
      globalUser = response.user;
      notifySubscribers();
      console.log('Đăng nhập thành công!');
    } catch (error: any) {
      console.error('Đăng nhập thất bại:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await authService.register(userData);
      console.log('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (error: any) {
      console.error('Đăng ký thất bại:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    globalUser = null;
    notifySubscribers();
    console.log('Đăng xuất thành công!');
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
};

// Initialize auth state
const initAuth = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const userData = await authService.getCurrentUser();
      globalUser = userData;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  globalLoading = false;
  notifySubscribers();
};

// Simple AuthProvider that just initializes auth
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth();
  }, []);

  return <>{children}</>;
}
