import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
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

export function Navbar({ onOpenCart = () => {} }) {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totals } = useStore();

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
          <img src="/solarmart-logo.jpg" alt="SolarMart" className="h-10 w-auto sm:h-11" />
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
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-deep/10 bg-brand-deep text-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label="Open cart"
          >
            <span className="text-base" aria-hidden="true">🛒</span>
            {totals.count ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-brand-deep">
                {totals.count}
              </span>
            ) : null}
          </button>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 rounded-full border border-brand-deep/10 bg-brand-deep px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-brand-green"
          >
            🛒 Cart ({totals.count})
          </button>
          <a
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand-green/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-brand-green/10 hover:text-brand-green"
          >
            WhatsApp
          </a>
        </div>
        </div>

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
            to="/cart"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-white/80 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`
            }
          >
            Cart
          </NavLink>
          <a
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-brand-green/10 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-deep transition hover:border-brand-green hover:text-brand-green"
          >
            WhatsApp
          </a>
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
          <a
            className="block hover:text-brand-green"
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            Order on WhatsApp
          </a>
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



