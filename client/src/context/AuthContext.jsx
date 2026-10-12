import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('codex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('codex_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('codex_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (loginVal, password) => {
    const res = await authService.login(loginVal, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('codex_token', res.token);
      localStorage.setItem('codex_user', JSON.stringify(res.user));
      return res;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('codex_token', res.token);
      localStorage.setItem('codex_user', JSON.stringify(res.user));
      return res;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('codex_token');
    localStorage.removeItem('codex_user');
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.user }));
      localStorage.setItem('codex_user', JSON.stringify({ ...user, ...res.user }));
      return res;
    }
  };

  const refreshUser = async () => {
    if (token) {
      const res = await authService.getMe();
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('codex_user', JSON.stringify(res.user));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user && !!token,
        isInstructor: user?.role === 'instructor' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
