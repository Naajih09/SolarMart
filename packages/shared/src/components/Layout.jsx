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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="section-shell">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src="/solarmart-logo.jpg" alt="SolarMart" className="h-10 w-auto sm:h-11" />
              <span className="text-xl font-black tracking-tight text-brand-deep">SolarMart</span>
            </Link>
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 lg:flex">
              Deliver to <span className="ml-2 font-semibold text-slate-900">Nigeria</span>
            </div>
          </div>

          <form onSubmit={submitSearch} className="order-3 w-full lg:order-2 lg:mx-6 lg:max-w-2xl">
            <label className="flex items-center gap-3 rounded-full border border-slate-300 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-brand-green">
              <span className="text-xl text-slate-400">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, kits, brands..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="button-primary rounded-full px-5 py-2 text-sm">
                Search
              </button>
            </label>
          </form>

          <div className="order-2 flex items-center gap-3 lg:order-3">
            <NavLink
              to="/products"
              className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:inline-flex"
            >
              Today's Deals
            </NavLink>
            <NavLink
              to="/cart"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <span aria-hidden="true">🛒</span>
              Cart ({totals.count})
            </NavLink>
            <NavLink
              to="/login"
              className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-full bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green"
            >
              Register
            </NavLink>
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

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-3 pt-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-deep text-white" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            Shop All
          </NavLink>
          <NavLink
            to="/products?category=Solar%20Kits"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Solar Kits
          </NavLink>
          <NavLink
            to="/products?category=Inverters"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Inverters
          </NavLink>
          <NavLink
            to="/products?category=Batteries"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Batteries
          </NavLink>
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



