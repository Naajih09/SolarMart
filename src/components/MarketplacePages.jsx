import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { categories, featuredSlugs, products, sampleAffiliateStats } from "../store/catalog";
import { company, formatNaira, getRecommendation, whatsappMessage } from "../site";

export function HomePage() {
  const featuredProducts = products.filter((product) => featuredSlugs.includes(product.slug));

  return (
    <>
      <section className="overflow-hidden bg-hero-grid">
        <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-7">
            <span className="eyebrow">Solar marketplace and affiliate platform</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl lg:text-6xl">
                Buy trusted solar products online and earn by referring customers.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-brand-slate/80 sm:text-lg">
                SolarMart now combines product shopping, secure checkout, affiliate
                referrals, and the NEPA calculator in one clean storefront for Nigeria.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="button-primary w-full sm:w-auto">
                Shop Solar Products
              </Link>
              <Link to="/affiliate" className="button-secondary w-full sm:w-auto">
                Become an Affiliate
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Secure checkout", "Ready for Paystack-backed payments"],
                ["Affiliate income", "Share product links and track commissions"],
                ["Smart recommendations", "Calculator still helps guide product choice"],
              ].map(([title, copy]) => (
                <div key={title} className="section-card p-5">
                  <p className="font-semibold text-brand-deep">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-brand-slate/75">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card grid gap-4 p-6 sm:p-8">
            {[
              ["Catalogue", "Browse inverters, panels, batteries, kits, and accessories"],
              ["Cart & Checkout", "Add to cart, checkout as guest, and submit orders"],
              ["Affiliate Dashboard", "Get a code, share links, and monitor commissions"],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl bg-brand-cream p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Platform
                </p>
                <p className="mt-3 text-xl font-bold text-brand-deep">{title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-slate/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="section-shell space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Featured products</span>
              <h2 className="mt-4 text-3xl font-bold text-brand-deep sm:text-4xl">
                Start with our best-selling solar solutions
              </h2>
            </div>
            <Link to="/products" className="button-secondary hidden sm:inline-flex">
              View all products
            </Link>
          </div>
          <ProductGrid items={featuredProducts} />
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="section-shell section-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <div className="space-y-4">
            <span className="eyebrow">Affiliate program</span>
            <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
              Turn your referrals into recurring solar income.
            </h2>
            <p className="text-base leading-7 text-brand-slate/75">
              Affiliates get a shareable code, trackable links, and commission visibility for
              every order that converts.
            </p>
            <Link to="/affiliate" className="button-primary">
              Open Affiliate Dashboard
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard label="Referral clicks" value="316" />
            <StatsCard label="Orders converted" value="6" />
            <StatsCard label="Commission earned" value={formatNaira(245000)} />
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductsPage() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let items = [...products];

    if (category !== "All") {
      items = items.filter((product) => product.category === category);
    }

    if (query.trim()) {
      const term = query.toLowerCase();
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term),
      );
    }

    if (sort === "price-low") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  }, [category, query, sort]);

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div className="space-y-4">
          <span className="eyebrow">Product catalogue</span>
          <h1 className="text-4xl font-extrabold text-brand-deep sm:text-5xl">
            Browse the SolarMart marketplace
          </h1>
        </div>

        <div className="section-card grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product, brand, or category"
            className="rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
          >
            <option value="All">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <ProductGrid items={filtered} />
      </div>
    </section>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);
  const { addToCart } = useStore();

  if (!product) {
    return <EmptyState title="Product not found" copy="The product you requested is not in the catalogue." />;
  }

  const related = products.filter((item) => product.relatedIds.includes(item.id));

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="section-card overflow-hidden">
            <img src={product.images[0]} alt={product.name} className="h-full min-h-[340px] w-full object-cover" />
          </div>
          <div className="space-y-5">
            <span className="eyebrow">{product.category}</span>
            <div>
              <h1 className="text-4xl font-extrabold text-brand-deep">{product.name}</h1>
              <p className="mt-3 text-base leading-7 text-brand-slate/75">{product.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCard label="Price" value={formatNaira(product.price)} />
              <DetailCard label="Availability" value={product.availability} />
              <DetailCard label="SKU" value={product.sku} />
              <DetailCard label="Rating" value={`${product.rating}/5`} />
            </div>
            <div className="rounded-3xl bg-brand-cream p-5">
              <p className="font-semibold text-brand-deep">Included features</p>
              <ul className="mt-3 space-y-2 text-sm text-brand-slate/75">
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => addToCart(product)} className="button-primary w-full sm:w-auto">
                Add to cart
              </button>
              <a
                href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary w-full sm:w-auto"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-deep">Related products</h2>
          <ProductGrid items={related} />
        </div>
      </div>
    </section>
  );
}

export function CartPage() {
  const { cart, totals, updateQuantity, removeFromCart } = useStore();

  if (!cart.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        copy="Browse the catalogue and add a few products to continue to checkout."
        actionLabel="Shop products"
        actionTo="/products"
      />
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="section-card grid gap-4 p-5 sm:grid-cols-[100px_1fr_auto] sm:items-center">
              <img src={item.image} alt={item.name} className="h-24 w-full rounded-2xl object-cover sm:w-24" />
              <div>
                <p className="font-semibold text-brand-deep">{item.name}</p>
                <p className="mt-1 text-sm text-brand-slate/70">{formatNaira(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                  className="w-20 rounded-2xl border border-brand-slate/10 bg-brand-cream px-3 py-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-full border border-brand-slate/10 px-3 py-2 text-sm font-semibold text-brand-deep"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <OrderSummary />
      </div>
    </section>
  );
}

export function CheckoutPage() {
  const { cart, totals, referralCode, clearCart } = useStore();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: company.email,
    address: "",
    city: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout could not be started.");
      }

      clearCart();
      setStatus({
        type: "success",
        message: data.message || "Order created successfully.",
      });

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Checkout could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        copy="Add products before attempting checkout."
        actionLabel="Browse products"
        actionTo="/products"
      />
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form className="section-card space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">Checkout</span>
            <h1 className="mt-4 text-3xl font-bold text-brand-deep">Place your solar order</h1>
          </div>
          <CheckoutField label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} required />
          <CheckoutField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} required />
          <CheckoutField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
          <CheckoutField label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} required />
          <CheckoutField label="City / State" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} required />
          {referralCode ? (
            <p className="rounded-2xl bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
              Affiliate referral applied: {referralCode}
            </p>
          ) : null}
          {status.message ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.type === "success" ? "bg-green-50 text-brand-green" : "bg-red-50 text-red-600"
              }`}
            >
              {status.message}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="button-primary w-full disabled:opacity-60">
            {loading ? "Processing..." : "Proceed to payment"}
          </button>
        </form>
        <OrderSummary />
      </div>
    </section>
  );
}

export function CalculatorPage() {
  const [monthlyBill, setMonthlyBill] = useState("");
  const parsed = Number(monthlyBill);
  const result = getRecommendation(parsed);
  const recommendationProduct = products.find((item) => result.suggestion.includes(item.name));

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <span className="eyebrow">Conversion tool</span>
          <h1 className="text-4xl font-extrabold text-brand-deep">NEPA bill calculator</h1>
          <p className="text-base leading-8 text-brand-slate/75">
            Estimate your spend, understand your energy tier, and jump straight into the
            most suitable product category.
          </p>
        </div>
        <div className="section-card space-y-5 p-6 sm:p-8">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-slate">
              Monthly electricity bill (NGN)
            </span>
            <input
              type="number"
              min="0"
              value={monthlyBill}
              onChange={(event) => setMonthlyBill(event.target.value)}
              className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none"
            />
          </label>
          <div className="rounded-3xl bg-brand-deep p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-yellow">{result.title}</p>
            <p className="mt-4 text-base leading-7">{result.copy}</p>
            <p className="mt-3 text-sm font-semibold text-brand-yellow">{result.suggestion}</p>
          </div>
          {recommendationProduct ? (
            <Link to={`/products/${recommendationProduct.slug}`} className="button-primary w-full sm:w-auto">
              View recommended product
            </Link>
          ) : (
            <Link to="/products" className="button-primary w-full sm:w-auto">
              Browse products
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function DashboardPage() {
  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div>
          <span className="eyebrow">User dashboard</span>
          <h1 className="mt-4 text-4xl font-extrabold text-brand-deep">Account overview</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <StatsCard label="Recent orders" value="3" />
          <StatsCard label="Awaiting payment" value="1" />
          <StatsCard label="Saved addresses" value="1" />
        </div>
        <div className="section-card p-6">
          <p className="text-lg font-semibold text-brand-deep">Recent order history</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-brand-slate/70">
                <tr>
                  <th className="py-3">Order ID</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["SM-1001", "Paid", formatNaira(3250000)],
                  ["SM-1002", "Pending", formatNaira(920000)],
                  ["SM-1003", "Delivered", formatNaira(165000)],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-brand-slate/10">
                    <td className="py-3">{row[0]}</td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AffiliatePage() {
  const { referralCode } = useStore();
  const code = referralCode || sampleAffiliateStats.affiliateCode;
  const shareLink = `${window.location.origin}/products?ref=${code}`;

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <span className="eyebrow">Affiliate dashboard</span>
            <h1 className="text-4xl font-extrabold text-brand-deep">Earn commission on every converted order</h1>
            <p className="text-base leading-8 text-brand-slate/75">
              Share your referral link, drive product purchases, and monitor commission
              performance in one place.
            </p>
          </div>
          <div className="section-card space-y-4 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
              Shareable link
            </p>
            <div className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-slate">
              {shareLink}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard label="Referral clicks" value={sampleAffiliateStats.clicks} />
              <StatsCard label="Commission earned" value={formatNaira(sampleAffiliateStats.commissionEarned)} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <StatsCard label="Total referrals" value={sampleAffiliateStats.totalReferrals} />
          <StatsCard label="Conversions" value={sampleAffiliateStats.conversions} />
          <StatsCard label="Pending payouts" value="1" />
          <StatsCard label="Affiliate code" value={code} />
        </div>

        <div className="section-card p-6">
          <p className="text-lg font-semibold text-brand-deep">Commission history</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-brand-slate/70">
                <tr>
                  <th className="py-3">Date</th>
                  <th className="py-3">Product</th>
                  <th className="py-3">Commission</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleAffiliateStats.transactions.map((item) => (
                  <tr key={item.id} className="border-t border-brand-slate/10">
                    <td className="py-3">{item.date}</td>
                    <td className="py-3">{item.product}</td>
                    <td className="py-3">{formatNaira(item.commission)}</td>
                    <td className="py-3">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AuthPage({ mode }) {
  const title = mode === "register" ? "Create your SolarMart account" : "Sign in to SolarMart";
  const subtitle =
    mode === "register"
      ? "Create an account to manage orders and affiliate referrals."
      : "Access your order history, referrals, and saved details.";

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-xl section-card p-6 sm:p-8">
          <span className="eyebrow">{mode === "register" ? "Register" : "Login"}</span>
          <h1 className="mt-4 text-3xl font-bold text-brand-deep">{title}</h1>
          <p className="mt-3 text-base leading-7 text-brand-slate/75">{subtitle}</p>
          <form className="mt-6 space-y-4">
            <CheckoutField label="Email" type="email" required />
            <CheckoutField label="Password" type="password" required />
            {mode === "register" ? <CheckoutField label="Phone" type="tel" required /> : null}
            <button type="button" className="button-primary w-full">
              {mode === "register" ? "Create account" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function ReferralLandingPage() {
  const { affiliateCode } = useParams();
  const navigate = useNavigate();
  const { setReferralCode } = useStore();

  useEffect(() => {
    if (affiliateCode) {
      setReferralCode(affiliateCode);
      navigate(`/products?ref=${affiliateCode}`, { replace: true });
    }
  }, [affiliateCode, navigate, setReferralCode]);

  return null;
}

function CheckoutField({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-brand-slate">{label}</span>
      <input
        {...props}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
      />
    </label>
  );
}

function ProductGrid({ items }) {
  const { addToCart } = useStore();

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {items.map((product) => (
        <article key={product.id} className="section-card overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="h-52 w-full object-cover" />
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-brand-green">{product.category}</p>
                <h3 className="mt-1 text-xl font-bold text-brand-deep">{product.name}</h3>
              </div>
              <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-deep">
                {product.rating}/5
              </span>
            </div>
            <p className="text-sm leading-6 text-brand-slate/75">{product.shortDescription}</p>
            <p className="text-lg font-bold text-brand-deep">{formatNaira(product.price)}</p>
            <div className="flex flex-col gap-3">
              <Link to={`/products/${product.slug}`} className="button-secondary w-full">
                View details
              </Link>
              <button type="button" onClick={() => addToCart(product)} className="button-primary w-full">
                Add to cart
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-slate/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-slate/60">{label}</p>
      <p className="mt-2 text-lg font-semibold text-brand-deep">{value}</p>
    </div>
  );
}

function StatsCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-brand-deep p-5 text-white">
      <p className="text-sm uppercase tracking-[0.18em] text-brand-yellow">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function OrderSummary() {
  const { totals } = useStore();

  return (
    <aside className="section-card h-fit p-6">
      <p className="text-xl font-bold text-brand-deep">Order summary</p>
      <div className="mt-5 space-y-3 text-sm text-brand-slate/75">
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
      <Link to="/checkout" className="button-primary mt-6 w-full">
        Continue to checkout
      </Link>
    </aside>
  );
}

function EmptyState({ title, copy, actionLabel, actionTo }) {
  return (
    <section className="py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl section-card p-8 text-center">
          <h1 className="text-3xl font-bold text-brand-deep">{title}</h1>
          <p className="mt-4 text-base leading-7 text-brand-slate/75">{copy}</p>
          {actionLabel && actionTo ? (
            <Link to={actionTo} className="button-primary mt-6">
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
