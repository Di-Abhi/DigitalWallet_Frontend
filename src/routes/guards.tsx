import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ROUTES } from './routePaths';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Requires the user to be authenticated; redirects to /login otherwise.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <Outlet />
    : <Navigate to={ROUTES.LOGIN} replace />;
}

// ─── Admin Route ──────────────────────────────────────────────────────────────
// Requires the user to be authenticated AND have the ADMIN role.
export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isAdmin)         return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}

// ─── Guest Route ──────────────────────────────────────────────────────────────
// Only accessible when NOT logged in; redirects authenticated users away.
export function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated)
    return <Navigate to={isAdmin ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}
