/**
 * ThemeContext — thin compatibility shim over Redux Toolkit themeSlice.
 * All components continue using `useTheme()` without any changes.
 */
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { toggleTheme, setTheme } from './slices/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);

  // Sync DOM on mount and theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => { dispatch(toggleTheme()); }, [dispatch]);
  const set = useCallback((t: 'light' | 'dark') => { dispatch(setTheme(t)); }, [dispatch]);

  return { theme, toggle, set, isDark: theme === 'dark' };
}

// Legacy provider — now a no-op passthrough
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
