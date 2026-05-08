import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { products } from "../../store/catalog";
import { company, formatNaira, getRecommendation, whatsappMessage } from "../../site";
import {
  CategoryIcon,
  HeroCarousel,
  HorizontalScroller,
  ProductCard,
  SectionHeader,
  TrustBadge,
  storeCategories,
} from "../commerce-ui";
import { DetailCard, EmptyState, OrderSummary, ProductGrid } from "./SharedPageParts";

function useProducts() {
  const [items] = useState(products);
  const [loading] = useState(false);

  return { items, loading };
}

function inferPowerRating(product) {
  const value = String(`${product.name} ${product.sku}`.toLowerCase());
  if (value.includes("10kva")) return "10kVA";
  if (value.includes("5kva")) return "5kVA";
  if (value.includes("3kva")) return "3kVA";
  if (value.includes("550w")) return "550W";
  if (value.includes("410w")) return "410W";
  return "All";
}

export function HomePage() {
  const { items, loading } = useProducts();
  const featuredProducts = items.slice(0, 8);
  const bestDeals = useMemo(
    () => [...items].sort((a, b) => Number(a.price || 0) - Number(b.price || 0)).slice(0, 8),
    [items],
  );
  const recommendedKits = items.filter((item) => item.category === "Solar Kits").slice(0, 8);

  return (
    <>
      <HeroCarousel />

      <section className="py-4 sm:py-6">
        <div className="section-shell space-y-5">
          <SectionHeader
            eyebrow="Quick browse"
            title="Shop by category"
            copy="Find solar kits, inverters, batteries, panels, and accessories in one place."
          />
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
            {storeCategories.map((item) => (
              <CategoryIcon key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-6">
        <div className="section-shell space-y-5">
          <SectionHeader
            eyebrow="Top products"
            title="Best-selling solar kits and components"
            copy="Browse the most popular items that customers order first."
            actionLabel="View catalogue"
            actionTo="/products"
          />
          <ProductGrid
            items={featuredProducts}
            loading={loading}
            emptyTitle="No featured products yet"
            emptyCopy="Add products to your catalogue to display them here."
            gridClassName="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4"
          />
        </div>
      </section>

      <section className="py-4 sm:py-6">
        <div className="section-shell space-y-5">
          <SectionHeader
            eyebrow="How it works"
            title="Order solar in three easy steps"
            copy="Browse, choose, and confirm your order with WhatsApp support."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Browse products",
                copy: "Select the right solar kit, inverter, or battery from our catalogue.",
              },
              {
                title: "Add to cart",
                copy: "Review your chosen products, then move to checkout with a single tap.",
              },
              {
                title: "Confirm by WhatsApp",
                copy: "Send your order link and get fast confirmation from our sales team.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-brand-slate/10 bg-white/80 p-6 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-brand-slate/75">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HorizontalScroller
        eyebrow="Best seller deals"
        title="Popular products customers choose"
        copy="Ready to ship solar systems and components with strong value."
        actionLabel="Shop all products"
        actionTo="/products"
        items={bestDeals}
        renderItem={(item) => <ProductCard product={item} compact />}
      />

      <HorizontalScroller
        eyebrow="Recommended systems"
        title="Solar kits for homes and small businesses"
        copy="Browse our most trusted solar kits with fast delivery support."
        actionLabel="See kits"
        actionTo="/products?category=Solar%20Kits"
        items={recommendedKits}
        renderItem={(item) => <ProductCard product={item} compact />}
      />

      <section className="py-4 sm:py-6">
        <div className="section-shell grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.25rem] bg-brand-deep p-6 text-white shadow-soft sm:p-8">
            <span className="eyebrow border-white/10 bg-white/10 text-brand-yellow">Ready to order</span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Confirm your order today with WhatsApp support.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Shop SolarMart products, add them to your cart, and complete your order with a quick WhatsApp message.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="button-primary w-full sm:w-auto">
                Shop solar products
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
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <TrustBadge
              title="Warranty included"
              copy="Clear product details and after-sales confidence."
            />
            <TrustBadge
              title="Installation help"
              copy="We support customers from order to setup."
            />
            <TrustBadge
              title="Fast delivery"
              copy="Nigeria-wide shipping for popular solar products."
            />
          </div>
        </div>
      </section>
    </>
  );
}

export function ProductsPage() {
  const { items, loading } = useProducts();

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div className="space-y-4">
          <span className="eyebrow">Shop all products</span>
          <h1 className="text-3xl font-extrabold text-brand-deep sm:text-5xl">
            Browse the full SolarMart catalogue
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-brand-slate/75 sm:text-base">
            Discover all available solar kits, inverters, batteries, panels, and accessories in one place.
          </p>
        </div>

        <ProductGrid
          items={items}
          loading={loading}
          emptyTitle="No products available"
          emptyCopy="Add products to your catalogue to show them here."
          gridClassName="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3"
        />
      </div>
    </section>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("description");

  useEffect(() => {
    const found = products.find((item) => item.slug === slug);
    setProduct(found || null);
    setRelated(products.filter((item) => item.slug !== slug).slice(0, 4));
  }, [slug]);

  if (!product) {
    return <EmptyState title="Product not found" copy="The product you requested is not in the catalogue." />;
  }

  const images = product.images?.length ? product.images : ["/solarmart-product-placeholder.svg"];
  const tabs = {
    description: (
      <div className="space-y-4 text-sm leading-7 text-brand-slate/75 sm:text-base">
        <p>{product.description}</p>
        <div className="rounded-[1.5rem] bg-brand-cream p-5">
          <p className="font-semibold text-brand-deep">Why it works</p>
          <p className="mt-2">
            Built for Nigerian power realities, this product helps reduce generator dependence and
            gives you a steadier daily power experience.
          </p>
        </div>
      </div>
    ),
    specifications: (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Category", product.category],
          ["Brand", product.brand],
          ["SKU", product.sku],
          ["Availability", product.availability],
          ["Stock", product.stock],
          ["Power fit", inferPowerRating(product)],
        ].map(([label, value]) => (
          <DetailCard key={label} label={label} value={String(value)} />
        ))}
      </div>
    ),
    reviews: (
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-brand-slate/10 bg-brand-cream p-5">
          <p className="font-semibold text-brand-deep">No reviews yet</p>
          <p className="mt-2 text-sm leading-7 text-brand-slate/75">
            Reviews will appear here after verified orders. SolarMart keeps this section clean
            until real customer feedback starts coming in.
          </p>
        </div>
      </div>
    ),
  };

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="section-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            <div className="glass-panel overflow-hidden">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
              />
            </div>
            {images.length > 1 ? (
              <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                      activeImage === index
                        ? "border-brand-green ring-2 ring-brand-green/20"
                        : "border-brand-slate/10"
                    }`}
                  >
                    <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <span className="eyebrow">{product.category}</span>
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-brand-deep sm:text-4xl">{product.name}</h1>
              <p className="text-sm leading-7 text-brand-slate/75 sm:text-base">
                {product.shortDescription}
              </p>
              <div className="rounded-[1.75rem] bg-brand-green/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Savings highlight
                </p>
                <p className="mt-2 text-sm leading-7 text-brand-slate/75">
                  Designed to reduce generator fuel spend, improve uptime, and make day-to-day power more predictable.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCard label="Price" value={formatNaira(product.price)} />
              <DetailCard label="Availability" value={product.availability} />
              <DetailCard label="SKU" value={product.sku} />
              <DetailCard label="Power fit" value={inferPowerRating(product)} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => addToCart(product)} className="button-primary w-full sm:w-auto">
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(product);
                  navigate("/cart");
                }}
                className="button-secondary w-full sm:w-auto"
              >
                View cart
              </button>
            </div>
            <div className="rounded-[1.75rem] border border-brand-slate/10 bg-white/80 p-3">
              <div className="flex flex-wrap gap-2">
                {["description", "specifications", "reviews"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      tab === item
                        ? "bg-brand-deep text-white"
                        : "bg-brand-cream text-brand-slate hover:text-brand-green"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4">{tabs[tab]}</div>
            </div>
          </div>
        </div>

        <HorizontalScroller
          eyebrow="Recommended solar products"
          title="More products that fit the same power profile"
          copy="Continue browsing with related SolarMart options."
          items={related}
          renderItem={(item) => <ProductCard product={item} compact />}
        />
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
        actionLabel="Shop solar products"
        actionTo="/products"
      />
    );
  }

  return (
    <section className="py-10 lg:py-16">
      <div className="section-shell grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="section-card grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:p-5">
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-full rounded-2xl object-cover sm:w-24"
              />
              <div>
                <p className="font-semibold text-brand-deep">{item.name}</p>
                <p className="mt-1 text-sm text-brand-slate/70">{formatNaira(item.price)}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                  className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-3 py-2 outline-none sm:w-20"
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
      <div className="fixed inset-x-0 bottom-20 z-30 border-t border-white/70 bg-white/90 px-4 py-3 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-slate/60">Cart total</p>
            <p className="text-lg font-bold text-brand-deep">{formatNaira(totals.total)}</p>
          </div>
          <Link to="/checkout" className="button-primary flex-1">
            Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CalculatorPage() {
  const [monthlyBill, setMonthlyBill] = useState("");
  const parsed = Number(monthlyBill);
  const result = getRecommendation(parsed);

  return (
    <section className="py-10 lg:py-16">
      <div className="section-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <span className="eyebrow">Conversion tool</span>
          <h1 className="text-3xl font-extrabold text-brand-deep sm:text-4xl">NEPA bill calculator</h1>
          <p className="text-sm leading-8 text-brand-slate/75 sm:text-base">
            Estimate your spend, understand your energy tier, and jump straight into the
            product path that fits.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <TrustBadge title="Fast results" copy="Get Naira totals and a product path in seconds." />
            <TrustBadge title="Practical guidance" copy="Built around real Nigerian energy use." />
            <TrustBadge title="Next step ready" copy="Move directly to products or a quote request." />
          </div>
        </div>
        <div className="section-card space-y-5 p-5 sm:p-8">
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
