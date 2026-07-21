import { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
// AI chat assistant — disabled on the public frontend until v2 (AI is admin-only
// on the backend for now). Re-enable this import alongside AIAssistantFab below.
// import { AIAssistant } from './components/public/AIAssistant';

// ─── QueryClient — configured to prevent double-fetching ─────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60_000,
      gcTime:    30 * 60_000,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

// ─── Lazy pages — code-split per route ───────────────────────────────────────
const HomePage   = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ListPropertyPage = lazy(() => import('./pages/ListPropertyPage'));
// AI chat pages — unrouted until v2. Restore these lazy imports and the
// matching <Route> entries below to bring them back.
// const AIPage = lazy(() => import('./pages/AIPage'));
// const HunterPage = lazy(() => import('./pages/HunterPage'));
// const FindPage = lazy(() => import('./pages/FindPage'));

// ─── Page loader skeleton ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f7f4] dark:bg-[#0d0d14]">
      <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-white/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        <span className="text-sm font-semibold">Loading…</span>
      </div>
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    // In production, send to your error tracker (Sentry etc.)
    console.error('[StayLynk]', err, info);
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f7f4] px-4 dark:bg-[#0d0d14]">
          <div className="max-w-sm text-center">
            <p className="mb-2 text-lg font-black text-slate-950 dark:text-white">Something went wrong</p>
            <p className="mb-4 text-sm font-medium text-slate-500 dark:text-white/45">Please refresh the page to continue.</p>
            <button
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

// Floating AI assistant — disabled on the public frontend until v2. Restore
// the AIAssistant import above and the <AIAssistantFab /> usage below to
// bring it back once AI is enabled for public hunters on the backend.
// function AIAssistantFab() {
//   const location = useLocation();
//   if (location.pathname === '/ai' || location.pathname === '/hunter' || location.pathname === '/find') return null;
//   return <AIAssistant />;
// }

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"       element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/listing/:slug" element={<ListingDetailPage />} />
              <Route path="/listings/:slug" element={<ListingDetailPage />} />
              <Route path="/property/:slug" element={<ListingDetailPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/list-property" element={<ListPropertyPage />} />
              <Route path="/privacy" element={<LegalPage />} />
              <Route path="/terms" element={<LegalPage />} />
              <Route path="/safety" element={<LegalPage />} />
              {/* AI chat routes — unrouted until v2, see lazy imports above */}
              {/* <Route path="/ai" element={<AIPage />} /> */}
              {/* <Route path="/hunter" element={<HunterPage />} /> */}
              {/* <Route path="/find" element={<FindPage />} /> */}
              <Route path="*"       element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
        {/* <AIAssistantFab /> */}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
