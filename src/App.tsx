import { AuthProvider }         from './store/AuthContext';
import { ThemeProvider }        from './store/ThemeContext';
import { NotificationProvider } from './store/NotificationContext';
import { ToastProvider }        from './shared/components/Toast';
import { AppRouter }            from './routes';

// ─── App ──────────────────────────────────────────────────────────────────────
// Responsibility: wrap the app in global context providers, then hand off
// all routing to <AppRouter>.  No route definitions live here.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider />
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
