import { lazy } from 'react';

// ─── Public Pages ─────────────────────────────────────────────────────────────
export const LandingPage = lazy(
  () => import('../features/landing/LandingPage'),
);

// ─── Auth Pages ───────────────────────────────────────────────────────────────
export const LoginPage = lazy(
  () => import('../features/auth/AuthPages').then((m) => ({ default: m.LoginPage })),
);

export const SignupPage = lazy(
  () => import('../features/auth/AuthPages').then((m) => ({ default: m.SignupPage })),
);

export const ForgotPasswordPage = lazy(
  () => import('../features/auth/AuthPages').then((m) => ({ default: m.ForgotPasswordPage })),
);

// ─── User Pages ───────────────────────────────────────────────────────────────
export const DashboardPage = lazy(
  () => import('../features/dashboard/DashboardPage'),
);

export const WalletPage = lazy(
  () => import('../features/wallet/WalletPage'),
);

export const TransferPage = lazy(
  () => import('../features/wallet/TransferPage'),
);

export const RewardsPage = lazy(
  () => import('../features/rewards/RewardsPage'),
);

export const TransactionsPage = lazy(
  () => import('../features/transactions/TransactionsPage'),
);

export const ProfilePage = lazy(
  () => import('../features/profile/ProfilePage'),
);

// ─── Admin Pages ──────────────────────────────────────────────────────────────
export const AdminPage = lazy(
  () => import('../features/admin/AdminPage'),
);
