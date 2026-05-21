import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth.js';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns null currentUser when no token', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toBeNull();
  });

  it('decodes currentUser from token in localStorage', () => {
    const payload = { sub: 'user-123', username: 'alice', role: 'player' };
    const token = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload)).replace(/=/g, '')}.sig`;
    localStorage.setItem('token', token);
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toEqual({ id: 'user-123', username: 'alice', role: 'player' });
  });

  it('returns null for invalid token format', () => {
    localStorage.setItem('token', 'invalid');
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toBeNull();
  });

  it('clears currentUser on logout', () => {
    const payload = { sub: 'u1', username: 'bob', role: 'admin' };
    const token = `h.${btoa(JSON.stringify(payload)).replace(/=/g, '')}.s`;
    localStorage.setItem('token', token);
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).not.toBeNull();
    act(() => {
      result.current.logout();
    });
    expect(result.current.currentUser).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
