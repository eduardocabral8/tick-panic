import { useState, useCallback, useMemo } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api.js';

function decodeJwtPayload(token: string): { sub?: string; username?: string; role?: string } | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const jsonPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
      id: payload.sub ?? '',
      username: payload.username ?? '',
      role: payload.role ?? '',
    };
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      const response = await apiLogin(username, password);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      return true;
    } catch {
      setError('Invalid credentials');
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, password: string, role: 'admin' | 'player') => {
    try {
      setError(null);
      await apiRegister(username, password, role);
      return true;
    } catch {
      setError('Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setError(null);
  }, []);

  return { token, currentUser, error, login, register, logout };
}
