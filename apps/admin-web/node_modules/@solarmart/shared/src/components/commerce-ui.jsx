import { Link } from "react-router-dom";
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
      className="group flex min-w-[104px] flex-col items-center gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-brand-green/25 hover:text-brand-green"
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
    <section className="overflow-hidden">
      <div className="section-shell py-8 sm:py-10">
        <div className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-white/70 bg-brand-deep shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-12">
            <span className="eyebrow w-fit rounded-full border border-white/20 bg-white/10 px-3 py-2 text-brand-yellow">
              SolarMart official store
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Solar kits, batteries, inverters and panels — shipped across Nigeria.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Shop ready-made solar systems with clear pricing, fast support, and direct WhatsApp order confirmation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="button-primary w-full sm:w-auto">
                Shop catalogue
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
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
                <p className="font-semibold text-brand-yellow">Fast delivery</p>
                <p className="mt-2 text-sm leading-6 text-white/80">Nationwide shipping and installation support for solar orders.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
                <p className="font-semibold text-brand-yellow">WhatsApp shopping</p>
                <p className="mt-2 text-sm leading-6 text-white/80">Confirm stock, pricing, and delivery directly with our team.</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_45%)]">
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

export function ProductCard({ product, badge, compact = false, onQuickView }) {
  const { addToCart } = useStore();
  const resolvedBadge =
    badge ||
    product.badge ||
    (product.stock <= 4 ? "Limited stock" : product.rating >= 4.8 ? "Best seller" : "New");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-soft transition duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
              compact ? "aspect-[4/3]" : "aspect-[4/3]"
            }`}
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-brand-cream px-6 text-center text-sm font-semibold text-brand-slate/65">
            Product image unavailable
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-brand-deep px-3 py-1 text-xs font-semibold text-white">
            {resolvedBadge}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
            {product.category}
          </p>
          <h3 className="text-lg font-bold text-brand-deep">{product.name}</h3>
          <p className="text-sm leading-6 text-brand-slate/75">{product.shortDescription}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-lg font-extrabold text-brand-deep">{formatNaira(product.price)}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-slate/60">
            {product.availability || "In stock"}
          </p>
        </div>
        <div className="mt-auto grid gap-3">
          <button type="button" onClick={() => addToCart(product)} className="button-primary w-full">
            Add to cart
          </button>
          <Link to={`/products/${product.slug}`} className="button-secondary w-full">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FilterSidebar({ filters, onChange, maxPrice = 6000000, brands = [], powerOptions = defaultPowerOptions }) {
  const categories = ["All", "Solar Kits", "Inverters", "Batteries", "Solar Panels", "Accessories"];

  return (
    <aside className="section-card space-y-5 p-5 lg:sticky lg:top-24">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green">Filters</p>
        <h3 className="mt-2 text-xl font-bold text-brand-deep">Refine products</h3>
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
                  : "border border-brand-slate/10 bg-white/80 text-brand-slate hover:border-brand-green hover:text-brand-green"
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
          className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
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
          className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
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
        className="button-secondary w-full"
      >
        Reset filters
      </button>
    </aside>
  );
}

export function CheckoutStepper({ step = 1 }) {
  const steps = [
    { key: "shipping", label: "Shipping" },
    { key: "payment", label: "Payment" },
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
              <TrustBadge title="Paystack secure payment" copy="Checkout safely with trusted payments." />
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
