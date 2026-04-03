import { Suspense } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { LoadingPage } from '../shared/components/UI';
import { publicRoutes }    from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes }     from './adminRoutes';
import { notFoundRoute }   from './notFoundRoute';

// ─── App Router ───────────────────────────────────────────────────────────────
// Single entry point for all routing.
// Route groups are defined in their own files and composed here.
//
// Route hierarchy:
//   /                → LandingPage        (public)
//   /login           → LoginPage          (guest-only)
//   /signup          → SignupPage         (guest-only)
//   /forgot-password → ForgotPasswordPage (guest-only)
//   /dashboard       → DashboardPage      (protected)
//   /wallet          → WalletPage         (protected)
//   /transfer        → TransferPage       (protected)
//   /rewards         → RewardsPage        (protected)
//   /transactions    → TransactionsPage   (protected)
//   /profile         → ProfilePage        (protected)
//   /admin           → AdminPage          (admin-only)
//   *                → NotFoundPage
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {publicRoutes()}
          {protectedRoutes()}
          {adminRoutes()}
          {notFoundRoute()}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
