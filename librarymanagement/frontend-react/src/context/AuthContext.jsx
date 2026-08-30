import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));

  const login = (userData, authToken, authRefreshToken) => {
    setUser(userData);
    setToken(authToken);
    if (authRefreshToken) {
      setRefreshToken(authRefreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    if (authRefreshToken) {
      localStorage.setItem('refreshToken', authRefreshToken);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        } else {
          setToken(e.newValue);
        }
      }
      if (e.key === 'refreshToken') {
        if (!e.newValue) {
          setRefreshToken(null);
        } else {
          setRefreshToken(e.newValue);
        }
      }
      if (e.key === 'user' && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
