import { Link, Navigate, Route, Routes } from "react-router-dom";
import {
  AuthPage,
  DashboardPage,
  EmptyState,
  ScrollToTop,
  company,
} from "@solarmart/shared";
import { AuthProvider, useAuth } from "../../../packages/shared/src/context/AuthContext";
import { ThemeProvider, ThemeToggle } from "../../../packages/shared/src/context/ThemeContext";

function AdminNavbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-deep/95 text-white backdrop-blur-2xl">
      <div className="section-shell flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight">{company.name} Admin</p>
          <p className="hidden text-sm text-white/70 sm:block">Products, orders, and partner operations in one workspace.</p>
        </div>
        <nav className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <ThemeToggle compact />
          <Link to="/dashboard" className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold sm:px-4">
            Dashboard
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-brand-yellow px-3 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5 sm:px-4"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-yellow px-3 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5 sm:px-4"
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
