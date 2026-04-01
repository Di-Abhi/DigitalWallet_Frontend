import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = useCallback((userData, tokens) => {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    sessionStorage.setItem('userId', userData.id);
    sessionStorage.setItem('userRole', userData.role);
    sessionStorage.setItem('userEmail', userData.email);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
