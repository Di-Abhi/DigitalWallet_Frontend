import { Route } from 'react-router-dom';
import { ROUTES } from './routePaths';
import { ProtectedRoute } from './guards';
import { PageWrapper } from './PageWrapper';
import {
  DashboardPage,
  WalletPage,
  TransferPage,
  RewardsPage,
  TransactionsPage,
  ProfilePage,
} from './lazyPages';

// ─── Protected Routes ─────────────────────────────────────────────────────────
// Requires authentication. Unauthenticated users are sent to /login.
// Every page is wrapped in AppLayout + ErrorBoundary + Suspense via PageWrapper.
export function protectedRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route
        path={ROUTES.DASHBOARD}
        element={<PageWrapper><DashboardPage /></PageWrapper>}
      />
      <Route
        path={ROUTES.WALLET}
        element={<PageWrapper><WalletPage /></PageWrapper>}
      />
      <Route
        path={ROUTES.TRANSFER}
        element={<PageWrapper><TransferPage /></PageWrapper>}
      />
      <Route
        path={ROUTES.REWARDS}
        element={<PageWrapper><RewardsPage /></PageWrapper>}
      />
      <Route
        path={ROUTES.TRANSACTIONS}
        element={<PageWrapper><TransactionsPage /></PageWrapper>}
      />
      <Route
        path={ROUTES.PROFILE}
        element={<PageWrapper><ProfilePage /></PageWrapper>}
      />
    </Route>
  );
}
