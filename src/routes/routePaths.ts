// ─── Route Path Constants ─────────────────────────────────────────────────────
// Single source of truth for all app route paths.
// Import ROUTES wherever you need to navigate or build links — never hard-code strings.

export const ROUTES = {
  // Public
  HOME:             '/',

  // Auth (guest-only)
  LOGIN:            '/login',
  SIGNUP:           '/signup',
  FORGOT_PASSWORD:  '/forgot-password',

  // User (protected)
  DASHBOARD:        '/dashboard',
  WALLET:           '/wallet',
  TRANSFER:         '/transfer',
  REWARDS:          '/rewards',
  TRANSACTIONS:     '/transactions',
  PROFILE:          '/profile',

  // Admin (admin-only)
  ADMIN:            '/admin',

  // Fallback
  NOT_FOUND:        '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
