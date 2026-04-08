import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { formatNaira } from "../../site";
import { brands, categories } from "../../store/catalog";
import { AdminTable, CheckoutField, EmptyState, StatsCard } from "./SharedPageParts";

export function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Kits",
    brand: "SolarMart",
    sku: "",
    price: "",
    stock: "",
    imageUrl: "",
    shortDescription: "",
    description: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    Promise.all([
        apiFetch("/api/admin?action=orders"),
        apiFetch("/api/admin?action=affiliates"),
                apiFetch("/api/admin?action=products"),
    ])
      .then(([ordersData, affiliatesData, productsData]) => {
        setOrders(ordersData.orders || []);
        setAffiliates(affiliatesData.affiliates || []);
        setAdminProducts(productsData.products || []);
      })
      .catch(() => null);
  }, [user]);

  async function approveAffiliate(id) {
    try {
      await apiFetch("/api/admin?action=affiliates", {
        method: "PATCH",
        body: JSON.stringify({ id, status: "approved" }),
      });
      setAffiliates((current) =>
        current.map((item) => (item.id === id ? { ...item, status: "approved" } : item)),
      );
      setAdminMessage("Affiliate approved.");
    } catch (error) {
      setAdminMessage(error.message);
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    try {
      const data = await apiFetch("/api/admin?action=products", {
        method: "POST",
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock || 0),
          availability: Number(productForm.stock || 0) > 0 ? "In stock" : "Out of stock",
          images: productForm.imageUrl ? [productForm.imageUrl] : [],
          features: [],
          variants: [],
          relatedIds: [],
        }),
      });
      setAdminProducts((current) => [data.product, ...current]);
      setAdminMessage("Product created.");
      setProductForm({
        name: "",
        category: "Kits",
        brand: "SolarMart",
        sku: "",
        price: "",
        stock: "",
        imageUrl: "",
        shortDescription: "",
        description: "",
      });
    } catch (error) {
      setAdminMessage(error.message);
    }
  }

  async function deleteProduct(productId) {
    try {
      await apiFetch(`/api/admin?action=products&id=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      setAdminProducts((current) => current.filter((item) => item.dbId !== productId && item.id !== productId));
      setAdminMessage("Product deleted.");
    } catch (error) {
      setAdminMessage(error.message);
    }
  }

  if (loading) {
    return <EmptyState title="Loading dashboard" copy="Preparing your account details." />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to continue"
        copy="Login or register to view your orders, account details, and admin tools."
        actionLabel="Login"
        actionTo="/login"
      />
    );
  }

  if (user.role === "admin") {
    return (
      <section className="py-12 lg:py-16">
        <div className="section-shell space-y-8">
          <div>
            <span className="eyebrow">Admin workspace</span>
            <h1 className="mt-4 text-4xl font-extrabold text-brand-deep">Official store operations</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-brand-slate/75">
              Manage official SolarMart products, monitor customer orders, and approve partner
              applications from one internal dashboard.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <StatsCard label="Products" value={adminProducts.length} />
            <StatsCard label="Orders" value={orders.length} />
            <StatsCard label="Partners" value={affiliates.length} />
          </div>
          <AdminTable
            title="Recent orders"
            headers={["Order", "Customer", "Total", "Status"]}
            rows={orders.map((item) => [
              item.order_number,
              item.customer_name,
              formatNaira(item.total),
              `${item.status} / ${item.payment_status}`,
            ])}
          />
          <AdminTable
            title="Partner applications"
            headers={["Code", "Name", "Status", "Commission"]}
            rows={affiliates.map((item) => [
              item.code,
              item.full_name || "Unknown",
              item.status,
              formatNaira(item.total_commission || 0),
            ])}
          />
          <div className="grid gap-8 xl:grid-cols-3">
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Add official product</p>
              <p className="mt-2 text-sm leading-6 text-brand-slate/70">
                Products now come only from the database. Add official store inventory here and it
                will appear in the storefront immediately after save.
              </p>
              <form className="mt-4 space-y-4" onSubmit={addProduct}>
                <CheckoutField label="Name" value={productForm.name} onChange={(value) => setProductForm((current) => ({ ...current, name: value }))} required />
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-slate">Category</span>
                  <select
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-slate">Brand</span>
                  <select
                    value={productForm.brand}
                    onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))}
                    className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
                  >
                    {brands.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <CheckoutField label="SKU" value={productForm.sku} onChange={(value) => setProductForm((current) => ({ ...current, sku: value }))} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CheckoutField label="Price" type="number" value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} required />
                  <CheckoutField label="Stock" type="number" value={productForm.stock} onChange={(value) => setProductForm((current) => ({ ...current, stock: value }))} required />
                </div>
                <CheckoutField label="Image URL" value={productForm.imageUrl} onChange={(value) => setProductForm((current) => ({ ...current, imageUrl: value }))} />
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-slate">Short description</span>
                  <textarea
                    value={productForm.shortDescription}
                    onChange={(event) => setProductForm((current) => ({ ...current, shortDescription: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-slate">Full description</span>
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
                  />
                </label>
                {adminMessage ? <p className="text-sm text-brand-green">{adminMessage}</p> : null}
                <button type="submit" className="button-primary w-full">
                  Save product
                </button>
              </form>
            </div>
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Current catalogue</p>
              <div className="mt-4 space-y-3">
                {adminProducts.length ? (
                  adminProducts.map((item) => (
                    <div key={item.dbId || item.id} className="flex flex-col gap-3 rounded-2xl bg-brand-cream p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-brand-deep">{item.name}</p>
                        <p className="text-sm text-brand-slate/70">
                          {item.category} · {formatNaira(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteProduct(item.dbId || item.id)}
                        className="rounded-full border border-brand-slate/10 px-4 py-2 text-sm font-semibold text-brand-deep"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-brand-slate/75">
                    No products in the database yet. Add your first real item from the form.
                  </p>
                )}
              </div>
            </div>
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Approve partner applications</p>
              <p className="mt-2 text-sm leading-6 text-brand-slate/70">
                Partners are referral sellers, not ordinary customer accounts. Approve them before
                they begin earning commission.
              </p>
              <div className="mt-4 space-y-3">
                {affiliates.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-brand-cream p-4">
                    <div>
                      <p className="font-semibold text-brand-deep">{item.full_name || item.code}</p>
                      <p className="text-sm text-brand-slate/70">{item.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => approveAffiliate(item.id)}
                      className="button-secondary"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div>
          <span className="eyebrow">Customer dashboard</span>
          <h1 className="mt-4 text-4xl font-extrabold text-brand-deep">Welcome back, {user.fullName}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-brand-slate/75">
            Review your customer account details and continue shopping from the official SolarMart store.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <StatsCard label="Role" value={user.role} />
          <StatsCard label="Email" value={user.email} />
          <StatsCard label="Phone" value={user.phone || "Not set"} />
        </div>
        <div className="section-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-deep">Account actions</p>
            <p className="mt-1 text-sm text-brand-slate/70">
              Continue shopping or end your current session.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="button-secondary">
              Browse products
            </Link>
            <button type="button" onClick={logout} className="button-primary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AffiliatePage() {
  const [stats, setStats] = useState({
    affiliateCode: "",
    totalReferrals: 0,
    commissionEarned: 0,
    clicks: 0,
    conversions: 0,
    pendingPayouts: 0,
    transactions: [],
  });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [lookupCode, setLookupCode] = useState("");

  async function loadAffiliateStats(code) {
    try {
      const data = await apiFetch(`/api/affiliate?action=stats&code=${encodeURIComponent(code)}`);
      setStats({
        affiliateCode: data.affiliateCode,
        totalReferrals: data.stats.totalReferrals || 0,
        commissionEarned: data.stats.commissionEarned || 0,
        clicks: data.stats.clicks || 0,
        conversions: data.stats.conversions || 0,
        pendingPayouts: data.stats.pendingPayouts || 0,
        transactions: data.stats.transactions || [],
      });
      setLookupCode(data.affiliateCode);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    try {
      const data = await apiFetch("/api/affiliate?action=signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const code = data.affiliate.code;
      setStats({
        affiliateCode: code,
        totalReferrals: data.affiliate.total_clicks || 0,
        commissionEarned: data.affiliate.total_commission || 0,
        clicks: data.affiliate.total_clicks || 0,
        conversions: data.affiliate.total_conversions || 0,
        pendingPayouts: 0,
        transactions: [],
      });
      setLookupCode(code);
      setMessage(`Affiliate signup received. Your code is ${data.affiliate.code}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const shareLink = typeof window === "undefined"
    ? `/products?ref=${stats.affiliateCode || "YOURCODE"}`
    : `${window.location.origin}/products?ref=${stats.affiliateCode || "YOURCODE"}`;

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell space-y-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <span className="eyebrow">Partner program</span>
            <h1 className="text-4xl font-extrabold text-brand-deep">Join SolarMart as a referral partner</h1>
            <p className="text-base leading-8 text-brand-slate/75">
              SolarMart sells the products directly. Approved partners promote the store, share
              referral links, and earn commission when referred orders convert.
            </p>
          </div>
          <div className="section-card space-y-4 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
              Partner link
            </p>
            <div className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-slate">{shareLink}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard label="Referral clicks" value={stats.clicks} />
              <StatsCard label="Commission earned" value={formatNaira(stats.commissionEarned)} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <StatsCard label="Referral clicks" value={stats.totalReferrals} />
          <StatsCard label="Conversions" value={stats.conversions} />
          <StatsCard label="Pending payouts" value={stats.pendingPayouts} />
          <StatsCard label="Partner code" value={stats.affiliateCode || "Not created yet"} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="section-card p-6">
            <p className="text-lg font-semibold text-brand-deep">Apply as a partner</p>
            <p className="mt-2 text-sm leading-7 text-brand-slate/75">
              This creates a partner application for SolarMart&apos;s approval workflow. It is not
              the same as a normal customer account.
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleSignup}>
              <CheckoutField label="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
              <CheckoutField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
              <CheckoutField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              {message ? <p className="text-sm text-brand-green">{message}</p> : null}
              <button type="submit" className="button-primary w-full">
                Submit partner application
              </button>
            </form>
            <div className="mt-8 border-t border-brand-slate/10 pt-6">
              <p className="text-lg font-semibold text-brand-deep">Load existing partner data</p>
              <div className="mt-4 space-y-4">
                <CheckoutField label="Partner code" value={lookupCode} onChange={setLookupCode} />
                <button
                  type="button"
                  onClick={() => loadAffiliateStats(lookupCode)}
                  className="button-secondary w-full"
                >
                  Load partner stats
                </button>
              </div>
            </div>
          </div>
          {stats.transactions.length ? (
            <AdminTable
              title="Partner transaction history"
              headers={["Date", "Product", "Commission", "Status"]}
              rows={stats.transactions.map((item) => [
                new Date(item.date).toLocaleDateString(),
                item.product,
                formatNaira(item.commission),
                item.status,
              ])}
            />
          ) : (
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Partner transaction history</p>
              <p className="mt-4 text-sm leading-7 text-brand-slate/75">
                No partner transactions yet. Once a referred order is paid, it will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
