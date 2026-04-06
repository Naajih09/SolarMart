import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { apiFetch } from "../../lib/api";
import { categories } from "../../store/catalog";
import { company, formatNaira, getRecommendation, whatsappMessage } from "../../site";
import { DetailCard, EmptyState, OrderSummary, ProductGrid, StatsCard } from "./SharedPageParts";

function useProducts(filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") {
      params.set("category", filters.category);
    }
    if (filters.q) {
      params.set("q", filters.q);
    }
    if (filters.sort && filters.sort !== "featured") {
      params.set("sort", filters.sort);
    }

    setLoading(true);
    apiFetch(`/api/store?action=products${params.toString() ? `&${params.toString()}` : ""}`)
      .then((data) => setItems(data.products || []))
      .finally(() => setLoading(false));
  }, [filters.category, filters.q, filters.sort]);

  return { items, loading };
}

export function HomePage() {
  const { items } = useProducts({});
  const featuredProducts = items.slice(0, 4);
  const [metrics, setMetrics] = useState({
    products: 0,
    paidOrders: 0,
    approvedAffiliates: 0,
  });

  useEffect(() => {
    apiFetch("/api/store?action=metrics")
      .then((data) => setMetrics(data.metrics || { products: 0, paidOrders: 0, approvedAffiliates: 0 }))
      .catch(() => setMetrics({ products: 0, paidOrders: 0, approvedAffiliates: 0 }));
  }, []);

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
                referrals, and the NEPA calculator in one storefront built for Nigeria.
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
                ["Secure checkout", "Paystack-backed transaction initialization"],
                ["Affiliate income", "Share links and monitor conversions"],
                ["Smart recommendations", "Use the calculator to match products to spend"],
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
              ["Cart and checkout", "Add to cart, checkout as guest, and complete payment"],
              ["Affiliate dashboard", "Use your code, track performance, and earn commissions"],
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
          <ProductGrid items={featuredProducts} loading={!featuredProducts.length} />
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="section-shell section-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <div className="space-y-4">
            <span className="eyebrow">Conversion tool</span>
            <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
              Still unsure what to buy? Estimate your bill and get a product path.
            </h2>
            <p className="text-base leading-7 text-brand-slate/75">
              The NEPA calculator remains part of the store experience so shoppers can
              turn monthly electricity spend into a clearer solar recommendation.
            </p>
            <Link to="/calculator" className="button-primary">
              Open calculator
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard label="Products listed" value={metrics.products || items.length} />
            <StatsCard label="Paid orders" value={metrics.paidOrders} />
            <StatsCard label="Approved affiliates" value={metrics.approvedAffiliates} />
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
  const { items, loading } = useProducts({ category, q: query, sort });

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

        <ProductGrid items={items} loading={loading} />
      </div>
    </section>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    apiFetch(`/api/store?action=products&id=${slug}`)
      .then((data) => {
        setProduct(data.product);
        return apiFetch("/api/store?action=products");
      })
      .then((data) => {
        setRelated((data.products || []).filter((item) => item.slug !== slug).slice(0, 4));
      })
      .catch(() => {
        setProduct(null);
        setRelated([]);
      });
  }, [slug]);

  if (!product) {
    return <EmptyState title="Product not found" copy="The product you requested is not in the catalogue." />;
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="section-card overflow-hidden">
            <img src={product.images?.[0]} alt={product.name} className="h-full min-h-[340px] w-full object-cover" />
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
                {(product.features || []).map((feature) => (
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
          <ProductGrid items={related} loading={false} />
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
        copy="Browse the catalogue and add products to continue to checkout."
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
        <OrderSummary subtotal={totals.subtotal} delivery={totals.delivery} total={totals.total} />
      </div>
    </section>
  );
}

export function CalculatorPage() {
  const [monthlyBill, setMonthlyBill] = useState("");
  const parsed = Number(monthlyBill);
  const result = getRecommendation(parsed);

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <span className="eyebrow">Conversion tool</span>
          <h1 className="text-4xl font-extrabold text-brand-deep">NEPA bill calculator</h1>
          <p className="text-base leading-8 text-brand-slate/75">
            Estimate your spend, understand your energy tier, and jump straight into the
            product path that fits.
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
          <Link to="/products" className="button-primary w-full sm:w-auto">
            Browse matching products
          </Link>
        </div>
      </div>
    </section>
  );
}
