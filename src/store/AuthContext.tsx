/**
 * AuthContext — thin compatibility shim over Redux Toolkit authSlice.
 * All components continue using `useAuth()` without any changes.
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { loginSuccess, logoutSuccess } from './slices/authSlice';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isAdmin } = useAppSelector((s) => s.auth);

  const login = useCallback(
    (userData: User, tokens: Tokens) => {
      dispatch(loginSuccess({ userData, tokens }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutSuccess());
  }, [dispatch]);

  return { user, isAuthenticated, isAdmin, login, logout };
}

// Legacy provider — now a no-op passthrough (Provider is in main.tsx via Redux <Provider>)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
