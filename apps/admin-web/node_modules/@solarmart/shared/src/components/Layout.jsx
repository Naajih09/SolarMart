import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useStore } from "../context/StoreContext";
import { apiFetch } from "../lib/api";
import { storeCategories } from "./commerce-ui";
import { company, whatsappMessage } from "../site";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export function captureReferral(code, setReferralCode) {
  if (!code) {
    return;
  }

  setReferralCode(code);
}

export function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`inline-flex items-center justify-center rounded-full border border-white/80 bg-white/80 font-semibold text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-brand-green hover:text-brand-green ${
        compact ? "h-11 w-11 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      {compact ? (theme === "dark" ? "☀" : "☾") : theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

export function Navbar({ onOpenCart = () => {} }) {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totals, setReferralCode } = useStore();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) {
      captureReferral(ref, setReferralCode);
      apiFetch("/api/affiliate?action=track", {
        method: "POST",
        body: JSON.stringify({ code: ref }),
      }).catch(() => null);
    }
  }, [location.search, setReferralCode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
  }, [location.search]);

  function submitSearch(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-brand-cream/80 backdrop-blur-2xl">
      <div className="section-shell py-3 sm:py-4">
        <div className="flex items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.25rem] bg-brand-deep font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.2)]">
            SM
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-brand-deep">{company.name}</p>
            <p className="hidden text-xs text-brand-slate/70 lg:block">{company.tagline}</p>
          </div>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 lg:block">
          <label className="flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <span className="text-lg text-brand-slate/50">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, kits, brands..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-brand-slate/45"
            />
            <button type="submit" className="button-primary px-4 py-2 text-sm">
              Search
            </button>
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <Link
            to="/affiliate"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-brand-green shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label="Partner program"
          >
            ⟡
          </Link>
          <Link
            to="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label="Account"
          >
            ◌
          </Link>
          <button
            type="button"
            onClick={onOpenCart}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label="Open cart"
          >
            🛒
          </button>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            to="/affiliate"
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-brand-green hover:text-brand-green"
          >
            ⟡ Partner
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-brand-green hover:text-brand-green"
          >
            ◌ {user?.role === "admin" ? "Admin" : "Account"}
          </Link>
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 rounded-full border border-brand-deep/10 bg-brand-deep px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-brand-green"
          >
            🛒 Cart ({totals.count})
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full px-4 py-2 text-sm font-medium text-brand-slate transition hover:bg-brand-green/10 hover:text-brand-green"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-brand-slate transition hover:bg-brand-green/10 hover:text-brand-green">
                Login
              </NavLink>
              <NavLink to="/register" className="rounded-full px-4 py-2 text-sm font-medium text-brand-slate transition hover:bg-brand-green/10 hover:text-brand-green">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
        </div>

        <form onSubmit={submitSearch} className="mt-3 flex gap-2 lg:hidden">
          <label className="flex w-full items-center gap-3 rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <span className="text-lg text-brand-slate/50">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, kits, brands..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-brand-slate/45"
            />
          </label>
          <button type="submit" className="button-primary shrink-0 px-4 py-3 text-sm">
            Go
          </button>
        </form>

        <div className="hide-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-white/80 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-white/80 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`
            }
          >
            Shop All
          </NavLink>
          <NavLink
            to="/calculator"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-white/80 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`
            }
          >
            Calculator
          </NavLink>
          <NavLink
            to="/affiliate"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-white/80 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`
            }
          >
            Partners
          </NavLink>
          {storeCategories.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-slate transition hover:border-brand-green hover:text-brand-green"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/50 bg-white/50 backdrop-blur">
      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="glass-panel space-y-3 p-6">
          <p className="text-2xl font-bold text-brand-deep">{company.name}</p>
          <p className="max-w-md text-sm leading-7 text-brand-slate/75">{company.tagline}</p>
        </div>
        <div className="glass-panel space-y-2 p-6 text-sm text-brand-slate/75">
          <p className="font-semibold text-brand-deep">Support</p>
          <a className="block hover:text-brand-green" href={`tel:${company.phone}`}>
            {company.phone}
          </a>
          <a className="block hover:text-brand-green" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          <a
            className="block hover:text-brand-green"
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp chat
          </a>
        </div>
        <div className="glass-panel space-y-2 p-6 text-sm text-brand-slate/75">
          <p className="font-semibold text-brand-deep">Marketplace</p>
          <Link className="block hover:text-brand-green" to="/products">
            Browse catalogue
          </Link>
          <Link className="block hover:text-brand-green" to="/affiliate">
            Partner program
          </Link>
          <Link className="block hover:text-brand-green" to="/checkout">
            Checkout
          </Link>
        </div>
      </div>
    </footer>
  );
}

export { BottomNavigation as MobileStickyBar } from "./commerce-ui";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 hidden rounded-full bg-brand-deep px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-green md:inline-flex"
    >
      WhatsApp
    </a>
  );
}
