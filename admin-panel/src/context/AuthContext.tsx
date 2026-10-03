import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  role: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setRole: (role: string | null) => void; // Keep for backward compatibility/layouts
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  setRole: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [role, setRoleState] = useState<string | null>(user?.role || null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setRoleState(newUser.role);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoleState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setRole = (newRole: string | null) => {
    setRoleState(newRole);
    if (!newRole) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
