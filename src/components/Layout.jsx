import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../data";
import { company, whatsappMessage } from "../site";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-slate/10 bg-brand-cream/90 backdrop-blur">
      <div className="section-shell flex items-center justify-between gap-3 py-3 md:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-green text-lg font-bold text-white md:h-11 md:w-11">
            S
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-brand-deep md:text-lg">
              {company.name}
            </p>
            <p className="hidden text-xs text-brand-slate/75 sm:block">{company.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-brand-green" : "text-brand-slate hover:text-brand-green"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-brand-slate/10 bg-white px-3 text-sm font-semibold text-brand-deep lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? "Close" : "Menu"}
          </button>
          <Link to="/quote" className="button-primary hidden shrink-0 sm:inline-flex">
            Request Quote
          </Link>
        </div>
      </div>

      {isOpen ? (
        <div className="section-shell pb-4 lg:hidden">
          <nav className="section-card grid gap-1 p-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-green text-white"
                      : "text-brand-slate hover:bg-brand-cream"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-brand-slate/10 bg-white">
      <div className="section-shell grid gap-8 py-10 text-center sm:text-left lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div>
          <p className="text-2xl font-bold text-brand-deep">{company.name}</p>
          <p className="mt-2 text-sm text-brand-slate/75">{company.tagline}</p>
        </div>
        <div className="space-y-2 text-sm text-brand-slate/75">
          <a className="block hover:text-brand-green" href={`tel:${company.phone}`}>
            {company.phone}
          </a>
          <a
            className="block hover:text-brand-green"
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a className="block hover:text-brand-green" href={`mailto:${company.email}`}>
            {company.email}
          </a>
        </div>
        <Link to="/quote" className="button-primary mx-auto w-full sm:mx-0 sm:w-auto">
          Request Quote
        </Link>
      </div>
    </footer>
  );
}

export function MobileStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-slate/10 bg-white/95 px-4 py-3 shadow-soft backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
        <Link to="/quote" className="button-primary w-full">
          Request Quote
        </Link>
        <a
          href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="button-secondary w-full"
        >
          WhatsApp
        </a>
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
      className="fixed bottom-5 right-5 z-40 hidden items-center rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-deep md:inline-flex"
    >
      WhatsApp
    </a>
  );
}

export function SimplePageShell({ eyebrow, title, intro, children }) {
  return (
    <section className="py-12 lg:py-20">
      <div className="section-shell space-y-8">
        <div className="max-w-3xl space-y-4">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="text-3xl font-extrabold leading-tight text-brand-deep sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="text-base leading-8 text-brand-slate/75">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
