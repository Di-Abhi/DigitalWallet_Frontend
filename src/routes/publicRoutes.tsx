import { Route } from 'react-router-dom';
import { ROUTES } from './routePaths';
import { GuestRoute } from './guards';
import {
  LandingPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
} from './lazyPages';

// ─── Public Routes ────────────────────────────────────────────────────────────
// Routes accessible to everyone (landing) and guests only (auth pages).
export function publicRoutes() {
  return (
    <>
      {/* Accessible to all */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Guest-only: redirect away if already logged in */}
      <Route element={<GuestRoute />}>
        <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP}          element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>
    </>
  );
}
