'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from LocalStorage on client mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('verba_token');
      const storedUser = localStorage.getItem('verba_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('verba_token', data.token);
        localStorage.setItem('verba_user', JSON.stringify(data.user));
        setLoading(false);
        return true;
      } else {
        throw new Error(data.error || 'Authentication with Google failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('verba_token');
    localStorage.removeItem('verba_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogleToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
