import { Link } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { company, formatNaira, whatsappMessage } from "../site";

export const storeCategories = [
  { label: "Solar Kits", emoji: "☀", to: "/products?category=Solar%20Kits" },
  { label: "Inverters", emoji: "⚡", to: "/products?category=Inverters" },
  { label: "Batteries", emoji: "🔋", to: "/products?category=Batteries" },
  { label: "Solar Panels", emoji: "◫", to: "/products?category=Solar%20Panels" },
  { label: "Accessories", emoji: "⌁", to: "/products?category=Accessories" },
];

const defaultPowerOptions = ["All", "3kVA", "5kVA", "10kVA", "410W", "550W"];

export function SectionHeader({ eyebrow, title, copy, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-deep sm:text-3xl">
            {title}
          </h2>
          {copy ? <p className="max-w-2xl text-sm leading-7 text-brand-slate/75 sm:text-base">{copy}</p> : null}
        </div>
      </div>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="button-secondary w-full sm:w-auto">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function TrustBadge({ title, copy }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-brand-slate/10 bg-white/80 p-4 shadow-soft">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
        ✓
      </span>
      <div>
        <p className="font-semibold text-brand-deep">{title}</p>
        <p className="mt-1 text-sm leading-6 text-brand-slate/70">{copy}</p>
      </div>
    </div>
  );
}

export function CategoryIcon({ label, emoji, to }) {
  return (
    <Link
      to={to}
      className="group flex min-w-[150px] flex-col items-center gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-brand-green/25 hover:text-brand-green sm:min-w-0"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-xl text-brand-green transition group-hover:bg-brand-green group-hover:text-white">
        {emoji}
      </span>
      <span className="text-sm font-semibold text-brand-deep">{label}</span>
    </Link>
  );
}

export function HeroCarousel() {
  return (
    <section className="overflow-hidden bg-slate-50 py-8 sm:py-10">
      <div className="section-shell">
        <div className="grid gap-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="eyebrow w-fit rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700">
              SolarMart marketplace
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Shop solar products with the clarity and convenience you expect.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Find panels, batteries, inverters, and complete kits, then order directly with fast support and easy checkout.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="button-primary w-full sm:w-auto">
                Shop now
              </Link>
              <a
                href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary w-full sm:w-auto"
              >
                Order on WhatsApp
              </a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Free delivery on larger orders",
                "Easy returns and customer support",
              ].map((text) => (
                <div key={text} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden bg-slate-100 sm:min-h-[340px]">
            <img
              src="/solarmart-hero-1.svg"
              alt="SolarMart store hero"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HorizontalScroller({
  eyebrow,
  title,
  copy,
  actionLabel,
  actionTo,
  items,
  renderItem,
  itemWidthClass = "w-[82vw] sm:w-[320px] lg:w-[340px]",
}) {
  return (
    <section className="py-4 sm:py-6">
      <div className="section-shell space-y-5">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          copy={copy}
          actionLabel={actionLabel}
          actionTo={actionTo}
        />
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
          {items.map((item, index) => (
            <div key={item.id || item.slug || `${title}-${index}`} className={`snap-start shrink-0 ${itemWidthClass}`}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product, badge, compact = false, onQuickView, imageOnly = false }) {
  const { addToCart } = useStore();
  const resolvedBadge =
    badge ||
    product.badge ||
    (product.stock <= 4 ? "Limited stock" : product.rating >= 4.8 ? "Best seller" : "New");
  const orderMessage = encodeURIComponent(
    `Hi, I want to order: ${product.name} - ${formatNaira(product.price)}`,
  );
  const [imageOnlyLoaded, setImageOnlyLoaded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (imageOnly) {

    return (
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Link to={`/products/${product.slug}`} className="block overflow-hidden relative">
          {!imageOnlyLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
              <div className="h-10 w-10 rounded-full bg-slate-300 animate-pulse" />
            </div>
          ) : null}

          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageOnlyLoaded(true)}
              className={`w-full h-full min-h-[160px] object-cover transition duration-300 ${imageOnlyLoaded ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-500">
              Product image unavailable
            </div>
          )}
          {product.vendorId && product.vendorName ? (
            <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
              Sold by {product.vendorName}
            </span>
          ) : null}
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-slate-100">
          {product.images?.[0] ? (
            <>
              {!imgLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
                  <div className="h-8 w-8 rounded-full bg-slate-300 animate-pulse" />
                </div>
              ) : null}
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${compact ? "aspect-square" : "aspect-square"} ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </>
          ) : (
          <div className="flex aspect-square items-center justify-center bg-slate-100 px-6 text-center text-sm font-semibold text-slate-500">
            Product image unavailable
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
            {resolvedBadge}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {product.category}
        </p>
        {product.vendorId && product.vendorName ? (
          <p className="truncate text-xs font-semibold text-brand-green">
            Sold by {product.vendorName}
          </p>
        ) : null}
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[3.25rem] text-base font-semibold leading-snug text-slate-900">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {product.rating ? <span>⭐ {product.rating.toFixed(1)}</span> : <span>New arrival</span>}
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{product.availability || "In stock"}</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-extrabold text-brand-deep">{formatNaira(product.price)}</p>
            <p className="text-xs text-slate-500">Free delivery on orders over ₦100,000</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {resolvedBadge}
          </span>
        </div>
        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <a
            href={`https://wa.me/${company.whatsappNumber}?text=${orderMessage}`}
            target="_blank"
            rel="noreferrer"
            className="button-secondary min-h-12 w-full px-4 text-center"
          >
            Order on WhatsApp
          </a>
          <button type="button" onClick={() => addToCart(product)} className="button-primary min-h-12 w-full px-4">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

export function FilterSidebar({ filters, onChange, maxPrice = 6000000, brands = [], powerOptions = defaultPowerOptions }) {
  const categories = ["All", "Solar Kits", "Inverters", "Batteries", "Solar Panels", "Accessories"];

  return (
    <aside className="space-y-4 rounded-2xl border border-brand-slate/10 bg-white p-4 shadow-sm lg:sticky lg:top-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">Filters</p>
        <h3 className="mt-1 text-lg font-bold text-brand-deep">Refine</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-brand-slate">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange({ category })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filters.category === category
                  ? "bg-brand-deep text-white"
                  : "border border-brand-slate/10 bg-white text-brand-slate hover:border-brand-green hover:text-brand-green"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-slate">Brand</span>
        <select
          value={filters.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
          className="w-full rounded-xl border border-brand-slate/10 bg-brand-cream px-3 py-2.5 text-sm outline-none focus:border-brand-green"
        >
          <option value="All">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-brand-slate">Power rating</span>
        <select
          value={filters.powerRating}
          onChange={(event) => onChange({ powerRating: event.target.value })}
          className="w-full rounded-xl border border-brand-slate/10 bg-brand-cream px-3 py-2.5 text-sm outline-none focus:border-brand-green"
        >
          {powerOptions.map((rating) => (
            <option key={rating} value={rating}>
              {rating}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-brand-slate">Maximum price</span>
          <span className="text-sm font-semibold text-brand-green">{formatNaira(filters.maxPrice)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxPrice}
          step="50000"
          value={filters.maxPrice}
          onChange={(event) => onChange({ maxPrice: Number(event.target.value) })}
          className="w-full accent-brand-green"
        />
      </label>

      <button
        type="button"
        onClick={() => onChange({ category: "All", brand: "All", powerRating: "All", maxPrice })}
        className="button-secondary w-full px-4"
      >
        Reset filters
      </button>
    </aside>
  );
}

export function CheckoutStepper({ step = 1 }) {
  const steps = [
    { key: "shipping", label: "Shipping" },
    { key: "confirm", label: "Confirm" },
    { key: "confirmation", label: "Confirmation" },
  ];

  return (
    <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-2">
        {steps.map((item, index) => {
          const active = index + 1 <= step;
          return (
            <div key={item.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  active ? "bg-brand-green text-white" : "bg-brand-cream text-brand-slate"
                }`}
              >
                {index + 1}
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${active ? "text-brand-green" : "text-brand-slate/60"}`}>
                  {item.label}
                </p>
              </div>
              {index < steps.length - 1 ? <div className="mx-2 h-px flex-1 bg-brand-slate/10" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MiniCartDrawer({ open, onClose }) {
  const { cart, totals, updateQuantity, removeFromCart } = useStore();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close mini cart"
        className="absolute inset-0 z-0 bg-brand-deep/40"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 z-10 flex h-full w-full max-w-md flex-col border-l border-white/70 bg-brand-cream shadow-soft sm:w-[420px]">
        <div className="border-b border-brand-slate/10 bg-brand-deep px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">Mini cart</p>
              <p className="text-lg font-bold">{cart.length ? `${cart.length} item(s) ready to checkout` : "No items in cart yet"}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              Close
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1">Secure ordering</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Local support</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Fast delivery</span>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-[1.5rem] border border-brand-slate/10 bg-white p-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-deep">{item.name}</p>
                      <p className="text-sm text-brand-slate/70">{formatNaira(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm font-semibold text-brand-green"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-slate/10 bg-brand-cream text-lg font-semibold text-brand-deep"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-brand-deep">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-slate/10 bg-brand-cream text-lg font-semibold text-brand-deep"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="grid min-h-[45vh] place-items-center rounded-[1.5rem] border border-brand-slate/10 bg-white p-6 text-center">
              <div className="max-w-sm space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Nothing added yet
                </p>
                <p className="text-lg font-semibold text-brand-deep">Your cart is empty</p>
                <p className="text-sm leading-6 text-brand-slate/75">
                  Browse products and add a solar kit, inverter, battery, or panel to continue.
                </p>
              </div>
              <Link to="/products" onClick={onClose} className="button-primary mt-5">
                Shop solar products
              </Link>
            </div>
          )}
        </div>
        <div className="border-t border-brand-slate/10 bg-white px-5 py-4">
          <div className="space-y-2 text-sm text-brand-slate/75">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatNaira(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span>{formatNaira(totals.delivery)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-brand-slate/10 pt-3 text-base font-semibold text-brand-deep">
              <span>Total</span>
              <span>{formatNaira(totals.total)}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link to="/cart" onClick={onClose} className="button-secondary w-full">
              View cart
            </Link>
            <Link to="/checkout" onClick={onClose} className="button-primary w-full">
              Checkout
            </Link>
          </div>
          <a
            className="mt-3 block text-center text-sm font-semibold text-brand-green"
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask on WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}

export function BottomNavigation() {
  const { totals } = useStore();

  const items = [
    { label: "Home", to: "/", icon: "⌂" },
    { label: "Power Solutions", to: "/products", icon: "▦" },
    { label: "Cart", to: "/cart", icon: "🛒", count: totals.count },
    { label: "Checkout", to: "/checkout", icon: "✔" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 px-3 py-2 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-brand-slate transition hover:bg-brand-green/5 hover:text-brand-green"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-sm text-brand-deep">
              {item.icon}
            </span>
            {item.label}
            {item.count ? (
              <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1 text-[10px] text-white">
                {item.count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function SplashCard({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close splash card"
        className="absolute inset-0 bg-brand-deep/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[220px] bg-brand-deep lg:min-h-full">
            <img
              src="/solarmart-hero-1.svg"
              alt="SolarMart storefront welcome"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 space-y-2 text-white">
              <span className="eyebrow w-fit border-white/10 bg-white/10 text-brand-yellow">Welcome to SolarMart</span>
              <p className="max-w-md text-sm leading-6 text-white/80">
                Modern solar products, clean pricing, and approved partner referrals built for Nigeria.
              </p>
            </div>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">SolarMart splash card</p>
                <h2 className="mt-2 text-3xl font-extrabold text-brand-deep">Official store for solar power in Nigeria</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-brand-slate/10 px-4 py-2 text-sm font-semibold text-brand-slate hover:border-brand-green hover:text-brand-green"
              >
                Close
              </button>
            </div>
            <p className="max-w-xl text-sm leading-7 text-brand-slate/75 sm:text-base">
              Shop home and business solar kits, compare savings, and move faster with approved partner support.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TrustBadge title="Installation available" copy="Book system setup with your order." />
              <TrustBadge title="Nationwide delivery" copy="Reach customers across Nigeria." />
              <TrustBadge title="Warranty included" copy="Buy with clearer after-sales confidence." />
              <TrustBadge title="WhatsApp ordering" copy="Confirm stock, delivery, and payment with our team." />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link to="/products" onClick={onClose} className="button-primary w-full sm:w-auto">
                Browse solar products
              </Link>
              <Link to="/calculator" onClick={onClose} className="button-secondary w-full sm:w-auto">
                Estimate my savings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
