import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { apiFetch } from "../lib/api";
import { company, whatsappMessage } from "../site";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Calculator", to: "/calculator" },
  { label: "Partners", to: "/affiliate" },
];

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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-brand-cream/80 backdrop-blur-2xl">
      <div className="section-shell flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.25rem] bg-brand-deep font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.2)]">
            SM
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-brand-deep">{company.name}</p>
            <p className="hidden text-xs text-brand-slate/70 lg:block">{company.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-deep text-white" : "text-brand-slate hover:bg-brand-green/10 hover:text-brand-green"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-deep text-white" : "text-brand-slate hover:bg-brand-green/10 hover:text-brand-green"
              }`
            }
          >
            {user?.role === "admin" ? "Admin" : "Account"}
          </NavLink>
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
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="hidden rounded-full border border-brand-green/10 bg-brand-green/10 px-4 py-2 text-sm font-semibold text-brand-green sm:inline-flex">
              {user?.fullName || "Account"}
            </span>
          ) : null}
          <Link
            to="/cart"
            className="hidden rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:inline-flex"
          >
            Cart ({totals.count})
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-deep shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="section-shell pb-4 lg:hidden">
          <nav className="glass-panel grid gap-2 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-brand-deep text-white" : "text-brand-slate hover:bg-brand-green/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-green/10"
            >
              {user?.role === "admin" ? "Admin" : "Account"}
            </NavLink>
            <NavLink
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-green/10"
            >
              Cart ({totals.count})
            </NavLink>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-brand-slate hover:bg-brand-green/10"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-green/10"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-green/10"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
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

export function MobileStickyBar() {
  const { totals } = useStore();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/80 px-4 py-3 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2">
        <Link to="/products" className="button-secondary w-full px-3 py-3 text-xs sm:text-sm">
          Shop
        </Link>
        <Link to="/cart" className="button-primary w-full px-3 py-3 text-xs sm:text-sm">
          Cart ({totals.count})
        </Link>
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="button-secondary w-full px-3 py-3 text-xs sm:text-sm">
          {user?.role === "admin" ? "Admin" : isAuthenticated ? "Account" : "Login"}
        </Link>
      </div>
    </div>
  );
}

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
