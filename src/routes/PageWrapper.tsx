import { Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import { ErrorBoundary, LoadingPage } from '../shared/components/UI';

interface PageWrapperProps {
  children: React.ReactNode;
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────
// Wraps every protected page with:
//   • AppLayout  – sidebar / topbar shell
//   • ErrorBoundary – catches render errors per-page
//   • Suspense – shows a loading spinner while the lazy chunk loads
export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}
