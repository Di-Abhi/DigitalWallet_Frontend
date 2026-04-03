import { Route } from 'react-router-dom';
import { ROUTES } from './routePaths';

// ─── Not Found Page ───────────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="text-7xl font-bold text-cyan-500 mb-4">404</div>
        <p className="font-semibold text-xl mb-2">Page not found</p>
        <a href="/" className="btn-primary inline-flex mt-4">
          ← Go home
        </a>
      </div>
    </div>
  );
}

// ─── Not Found Route ──────────────────────────────────────────────────────────
export function notFoundRoute() {
  return (
    <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
  );
}
