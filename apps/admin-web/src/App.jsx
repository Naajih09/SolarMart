import { Link, Navigate, Route, Routes } from "react-router-dom";
import {
  AuthPage,
  AuthProvider,
  DashboardPage,
  EmptyState,
  ScrollToTop,
  company,
  ThemeProvider,
  ThemeToggle,
  useAuth,
} from "@solarmart/shared";

function AdminNavbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-deep/95 text-white backdrop-blur-2xl">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-lg font-bold tracking-tight">{company.name} Admin</p>
          <p className="text-sm text-white/70">Products, orders, and partner operations in one workspace.</p>
        </div>
        <nav className="flex items-center gap-3">
          <ThemeToggle compact />
          <Link to="/dashboard" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold">
            Dashboard
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
          {user?.fullName ? (
            <span className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-semibold md:inline-flex">
              {user.fullName}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function AdminGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <EmptyState title="Loading admin workspace" copy="Checking your admin session." />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Admin sign-in required"
        copy="Use your admin account to manage the SolarMart storefront."
        actionLabel="Login"
        actionTo="/login"
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <EmptyState
        title="Admin access only"
        copy="This workspace is reserved for SolarMart administrators. Sign in with an admin account instead."
        actionLabel="Go to login"
        actionTo="/login"
      />
    );
  }

  return <DashboardPage />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-brand-cream bg-hero-grid text-brand-slate">
          <ScrollToTop />
          <AdminNavbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminGate />} />
              <Route path="/login" element={<AuthPage mode="login" context="admin" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
