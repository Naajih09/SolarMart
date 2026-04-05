import { useEffect, useState } from "react";
import { apiFetch, getToken } from "../../lib/api";
import { sampleAffiliateStats } from "../../store/catalog";
import { formatNaira } from "../../site";
import { AdminTable, CheckoutField, EmptyState, StatsCard } from "./SharedPageParts";

function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    apiFetch("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

export function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [orders, setOrders] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [productForm, setProductForm] = useState({
    externalId: "",
    slug: "",
    name: "",
    category: "Kits",
    brand: "SolarMart",
    sku: "",
    price: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    Promise.all([
      apiFetch("/api/admin/orders"),
      apiFetch("/api/admin/affiliates"),
      apiFetch("/api/admin/products"),
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
      await apiFetch("/api/admin/affiliates", {
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
      const data = await apiFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          availability: "In stock",
          stock: 1,
          images: [],
          shortDescription: "New product added from admin dashboard.",
          description: "Update this description in the database-backed product admin flow.",
          features: [],
          variants: [],
          relatedIds: [],
        }),
      });
      setAdminProducts((current) => [data.product, ...current]);
      setAdminMessage("Product created.");
      setProductForm({
        externalId: "",
        slug: "",
        name: "",
        category: "Kits",
        brand: "SolarMart",
        sku: "",
        price: "",
      });
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
            <span className="eyebrow">Admin dashboard</span>
            <h1 className="mt-4 text-4xl font-extrabold text-brand-deep">Store management</h1>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <StatsCard label="Products" value={adminProducts.length} />
            <StatsCard label="Orders" value={orders.length} />
            <StatsCard label="Affiliates" value={affiliates.length} />
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
            title="Affiliates"
            headers={["Code", "Name", "Status", "Commission"]}
            rows={affiliates.map((item) => [
              item.code,
              item.full_name || "Unknown",
              item.status,
              formatNaira(item.total_commission || 0),
            ])}
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Add product</p>
              <form className="mt-4 space-y-4" onSubmit={addProduct}>
                <CheckoutField label="External ID" value={productForm.externalId} onChange={(value) => setProductForm((current) => ({ ...current, externalId: value }))} required />
                <CheckoutField label="Slug" value={productForm.slug} onChange={(value) => setProductForm((current) => ({ ...current, slug: value }))} required />
                <CheckoutField label="Name" value={productForm.name} onChange={(value) => setProductForm((current) => ({ ...current, name: value }))} required />
                <CheckoutField label="SKU" value={productForm.sku} onChange={(value) => setProductForm((current) => ({ ...current, sku: value }))} required />
                <CheckoutField label="Price" type="number" value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} required />
                {adminMessage ? <p className="text-sm text-brand-green">{adminMessage}</p> : null}
                <button type="submit" className="button-primary w-full">
                  Save product
                </button>
              </form>
            </div>
            <div className="section-card p-6">
              <p className="text-lg font-semibold text-brand-deep">Approve affiliates</p>
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
          <span className="eyebrow">User dashboard</span>
          <h1 className="mt-4 text-4xl font-extrabold text-brand-deep">Welcome back, {user.fullName}</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <StatsCard label="Role" value={user.role} />
          <StatsCard label="Email" value={user.email} />
          <StatsCard label="Phone" value={user.phone || "Not set"} />
        </div>
      </div>
    </section>
  );
}

export function AffiliatePage() {
  const [stats, setStats] = useState(sampleAffiliateStats);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  async function handleSignup(event) {
    event.preventDefault();
    try {
      const data = await apiFetch("/api/affiliate", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStats((current) => ({
        ...current,
        affiliateCode: data.affiliate.code,
      }));
      setMessage(`Affiliate signup received. Your code is ${data.affiliate.code}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const shareLink = typeof window === "undefined"
    ? `/products?ref=${stats.affiliateCode}`
    : `${window.location.origin}/products?ref=${stats.affiliateCode}`;

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
            <div className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-slate">{shareLink}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard label="Referral clicks" value={stats.clicks} />
              <StatsCard label="Commission earned" value={formatNaira(stats.commissionEarned)} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <StatsCard label="Total referrals" value={stats.totalReferrals} />
          <StatsCard label="Conversions" value={stats.conversions} />
          <StatsCard label="Pending payouts" value="1" />
          <StatsCard label="Affiliate code" value={stats.affiliateCode} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="section-card p-6">
            <p className="text-lg font-semibold text-brand-deep">Become an affiliate</p>
            <form className="mt-4 space-y-4" onSubmit={handleSignup}>
              <CheckoutField label="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
              <CheckoutField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
              <CheckoutField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              {message ? <p className="text-sm text-brand-green">{message}</p> : null}
              <button type="submit" className="button-primary w-full">
                Create affiliate account
              </button>
            </form>
          </div>
          <AdminTable
            title="Sample transaction history"
            headers={["Date", "Product", "Commission", "Status"]}
            rows={sampleAffiliateStats.transactions.map((item) => [
              item.date,
              item.product,
              formatNaira(item.commission),
              item.status,
            ])}
          />
        </div>
      </div>
    </section>
  );
}
