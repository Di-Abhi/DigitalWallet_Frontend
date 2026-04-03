import { Route } from 'react-router-dom';
import { ROUTES } from './routePaths';
import { AdminRoute } from './guards';
import { PageWrapper } from './PageWrapper';
import { AdminPage } from './lazyPages';

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// Requires authentication AND the ADMIN role.
// Non-admins are redirected to /dashboard; guests to /login.
export function adminRoutes() {
  return (
    <Route element={<AdminRoute />}>
      <Route
        path={ROUTES.ADMIN}
        element={<PageWrapper><AdminPage /></PageWrapper>}
      />
    </Route>
  );
}
