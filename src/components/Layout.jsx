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
  { label: "Affiliate", to: "/affiliate" },
  { label: "Account", to: "/dashboard" },
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
    <header className="sticky top-0 z-50 border-b border-brand-slate/10 bg-brand-cream/95 backdrop-blur">
      <div className="section-shell flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-green font-bold text-white">
            SM
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-brand-deep">{company.name}</p>
            <p className="hidden text-xs text-brand-slate/70 lg:block">{company.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-brand-green" : "text-brand-slate hover:text-brand-green"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-brand-slate transition hover:text-brand-green"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium text-brand-slate transition hover:text-brand-green">
                Login
              </NavLink>
              <NavLink to="/register" className="text-sm font-medium text-brand-slate transition hover:text-brand-green">
                Sign Up
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="hidden rounded-full bg-brand-green/10 px-4 py-2 text-sm font-semibold text-brand-green sm:inline-flex">
              {user?.fullName || "Account"}
            </span>
          ) : null}
          <Link
            to="/cart"
            className="hidden rounded-full border border-brand-slate/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep sm:inline-flex"
          >
            Cart ({totals.count})
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex rounded-full border border-brand-slate/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="section-shell pb-4 lg:hidden">
          <nav className="section-card grid gap-2 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-brand-green text-white" : "text-brand-slate hover:bg-brand-cream"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-cream"
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
                className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-brand-slate hover:bg-brand-cream"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-cream"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-brand-slate hover:bg-brand-cream"
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
    <footer className="border-t border-brand-slate/10 bg-white">
      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="text-2xl font-bold text-brand-deep">{company.name}</p>
          <p className="max-w-md text-sm leading-7 text-brand-slate/75">{company.tagline}</p>
        </div>
        <div className="space-y-2 text-sm text-brand-slate/75">
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
        <div className="space-y-2 text-sm text-brand-slate/75">
          <p className="font-semibold text-brand-deep">Marketplace</p>
          <Link className="block hover:text-brand-green" to="/products">
            Browse catalogue
          </Link>
          <Link className="block hover:text-brand-green" to="/affiliate">
            Become an affiliate
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-slate/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
        <Link to="/products" className="button-secondary w-full">
          Shop Products
        </Link>
        <Link to="/cart" className="button-primary w-full">
          Cart ({totals.count})
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
      className="fixed bottom-5 right-5 z-40 hidden rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-soft md:inline-flex"
    >
      WhatsApp
    </a>
  );
}
