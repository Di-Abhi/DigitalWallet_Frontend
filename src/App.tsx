import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { NotificationProvider } from './store/NotificationContext';
import { ToastProvider } from './shared/components/Toast';
import AppLayout from './layouts/AppLayout';
import LandingPage from './features/landing/LandingPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './features/auth/AuthPages';
import DashboardPage from './features/dashboard/DashboardPage';
import WalletPage from './features/wallet/WalletPage';
import TransferPage from './features/wallet/TransferPage';
import RewardsPage from './features/rewards/RewardsPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import ProfilePage from './features/profile/ProfilePage';
import AdminPage from './features/admin/AdminPage';
import { ErrorBoundary } from './shared/components/UI';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return <Outlet />;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <AppLayout><ErrorBoundary>{children}</ErrorBoundary></AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider />
            <Routes>
              {/* Landing page — public */}
              <Route path="/" element={<LandingPage />} />

              {/* Guest-only routes (redirect if logged in) */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected user routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Wrap><DashboardPage /></Wrap>} />
                <Route path="/wallet" element={<Wrap><WalletPage /></Wrap>} />
                <Route path="/transfer" element={<Wrap><TransferPage /></Wrap>} />
                <Route path="/rewards" element={<Wrap><RewardsPage /></Wrap>} />
                <Route path="/transactions" element={<Wrap><TransactionsPage /></Wrap>} />
                <Route path="/profile" element={<Wrap><ProfilePage /></Wrap>} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Wrap><AdminPage /></Wrap>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-cyan-500 mb-4">404</div>
                    <p className="font-semibold text-xl mb-2">Page not found</p>
                    <a href="/" className="btn-primary inline-flex mt-4">← Go home</a>
                  </div>
                </div>
              } />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
