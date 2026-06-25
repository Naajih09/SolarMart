import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AuthProvider,
  EmptyState,
  ScrollToTop,
  ThemeProvider,
  ThemeToggle,
  apiFetch,
  company,
  formatNaira,
  useAuth,
} from "@solarmart/shared";

const categories = ["Solar Kits", "Inverters", "Batteries", "Solar Panels", "Accessories"];

const emptyProductForm = {
  name: "",
  category: "Solar Kits",
  price: "",
  stock: "",
  imageUrl: "",
  description: "",
};

function Field({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-brand-slate">{label}</span>
      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
      />
    </label>
  );
}

function TextAreaField({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-brand-slate">{label}</span>
      <textarea
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
      />
    </label>
  );
}

function StatusBadge({ status }) {
  const label = String(status || "pending").replace("_", " ");
  const tone =
    status === "approved" ? "bg-green-50 text-brand-green" :
    status === "rejected" ? "bg-red-50 text-red-600" :
    "bg-yellow-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${tone}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="surface-dark p-4 sm:p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-brand-yellow/90">{label}</p>
      <p className="mt-3 break-words text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

function VendorNavbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-deep/95 text-white backdrop-blur-2xl">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-lg font-bold tracking-tight">{company.name} Vendor</p>
          <p className="hidden text-sm text-white/70 sm:block">Products, approvals, and sales in one workspace.</p>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle compact />
          <Link to="/dashboard" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold">
            Dashboard
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-deep transition hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
          {user?.businessName ? (
            <span className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-semibold lg:inline-flex">
              {user.businessName}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function VendorAuthPage({ mode }) {
  const navigate = useNavigate();
  const { user, vendorLogin, vendorRegister } = useAuth();
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const isRegister = mode === "register";

  useEffect(() => {
    if (user?.role === "vendor" && user.vendorStatus === "approved") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      if (isRegister) {
        const data = await vendorRegister(form);
        setMessage({ type: "success", text: data.message });
        setForm({ businessName: "", email: "", phone: "", password: "" });
      } else {
        await vendorLogin({ email: form.email, password: form.password });
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  return (
    <section className="py-10 lg:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-xl section-card p-5 sm:p-8">
          <span className="eyebrow">{isRegister ? "Vendor Application" : "Vendor Login"}</span>
          <h1 className="mt-4 text-3xl font-bold text-brand-deep">
            {isRegister ? "Apply to sell on SolarMart" : "Sign in to your vendor workspace"}
          </h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <Field
                label="Business name"
                value={form.businessName}
                onChange={(value) => setForm((current) => ({ ...current, businessName: value }))}
                required
              />
            ) : null}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              required
            />
            {isRegister ? (
              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              />
            ) : null}
            <Field
              label="Password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(value) => setForm((current) => ({ ...current, password: value }))}
              required
            />
            {message.text ? (
              <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-brand-green"}`}>
                {message.text}
              </p>
            ) : null}
            <button type="submit" className="button-primary w-full">
              {isRegister ? "Submit application" : "Login"}
            </button>
            <p className="text-center text-sm text-brand-slate/70">
              {isRegister ? "Already approved?" : "Need a vendor account?"}{" "}
              <Link
                to={isRegister ? "/login" : "/register"}
                className="font-semibold text-brand-green hover:text-brand-deep"
              >
                {isRegister ? "Login here" : "Apply here"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function ProductForm({ editingProduct, onCancel, onSaved }) {
  const [form, setForm] = useState(emptyProductForm);
  const [message, setMessage] = useState({ type: "", text: "" });
  const isEditing = Boolean(editingProduct);

  useEffect(() => {
    if (!editingProduct) {
      setForm(emptyProductForm);
      return;
    }

    setForm({
      name: editingProduct.name || "",
      category: editingProduct.category || "Solar Kits",
      price: editingProduct.price || "",
      stock: editingProduct.stock || "",
      imageUrl: editingProduct.images?.[0] || "",
      description: editingProduct.description || "",
    });
  }, [editingProduct]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      images: form.imageUrl ? [form.imageUrl] : [],
    };

    try {
      const data = await apiFetch("/api/vendor?action=products", {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          ...payload,
          id: editingProduct?.dbId || editingProduct?.id,
        }),
      });
      setMessage({ type: "success", text: data.message });
      setForm(emptyProductForm);
      onSaved();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  return (
    <div className="section-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-brand-deep">
            {isEditing ? "Edit product" : "Add product"}
          </p>
          <p className="mt-1 text-sm leading-6 text-brand-slate/70">
            Saved changes are submitted to SolarMart for review before going live.
          </p>
        </div>
        {isEditing ? (
          <button type="button" onClick={onCancel} className="button-secondary">
            Cancel edit
          </button>
        ) : null}
      </div>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-brand-slate">Category</span>
          <select
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="w-full rounded-2xl border border-brand-slate/10 bg-brand-cream px-4 py-3 outline-none focus:border-brand-green"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" type="number" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} required />
          <Field label="Stock" type="number" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} required />
        </div>
        <Field label="Image URL" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} />
        <TextAreaField label="Description" rows={5} value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} required />
        {message.text ? (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-brand-green"}`}>
            {message.text}
          </p>
        ) : null}
        <button type="submit" className="button-primary w-full">
          {isEditing ? "Save and submit for review" : "Submit product for review"}
        </button>
      </form>
    </div>
  );
}

function VendorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState({
    vendor: null,
    metrics: { totalSales: 0, liveProducts: 0, pendingProducts: 0 },
    products: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setMessage("");
    try {
      const data = await apiFetch("/api/vendor?action=dashboard");
      setDashboard({
        vendor: data.vendor,
        metrics: data.metrics || { totalSales: 0, liveProducts: 0, pendingProducts: 0 },
        products: data.products || [],
        orders: data.orders || [],
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const rejectedProducts = useMemo(
    () => dashboard.products.filter((product) => product.approvalStatus === "rejected"),
    [dashboard.products],
  );

  if (loading) {
    return <EmptyState title="Loading vendor workspace" copy="Preparing your products and sales." />;
  }

  if (message) {
    return (
      <EmptyState
        title="Vendor dashboard unavailable"
        copy={message}
        actionLabel="Back to login"
        actionTo="/login"
      />
    );
  }

  return (
    <section className="py-10 lg:py-14">
      <div className="section-shell space-y-6">
        <div className="section-card p-5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Vendor workspace</span>
              <h1 className="mt-4 text-3xl font-extrabold text-brand-deep sm:text-4xl">
                {dashboard.vendor?.business_name || user?.businessName || "Vendor dashboard"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-slate/70">
                Manage submitted products, track review status, and see orders that include your products.
              </p>
            </div>
            <StatusBadge status={dashboard.vendor?.status || user?.vendorStatus} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total sales" value={formatNaira(dashboard.metrics.totalSales)} />
          <StatCard label="Live products" value={dashboard.metrics.liveProducts} />
          <StatCard label="Pending products" value={dashboard.metrics.pendingProducts} />
        </div>

        <div className="flex flex-wrap gap-2">
          {["overview", "products", "orders"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-brand-deep text-white"
                  : "border border-brand-slate/10 bg-white/80 text-brand-deep"
              }`}
            >
              {tab === "orders" ? "Sales / orders" : tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="section-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-brand-deep">Review snapshot</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-brand-cream p-4">
                  <span className="text-sm font-semibold text-brand-slate/75">Approved</span>
                  <span className="text-lg font-bold text-brand-deep">{dashboard.metrics.liveProducts}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-brand-cream p-4">
                  <span className="text-sm font-semibold text-brand-slate/75">Pending review</span>
                  <span className="text-lg font-bold text-brand-deep">{dashboard.metrics.pendingProducts}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-brand-cream p-4">
                  <span className="text-sm font-semibold text-brand-slate/75">Rejected</span>
                  <span className="text-lg font-bold text-brand-deep">{rejectedProducts.length}</span>
                </div>
              </div>
            </div>
            <ProductForm
              editingProduct={editingProduct}
              onCancel={() => setEditingProduct(null)}
              onSaved={() => {
                setEditingProduct(null);
                loadDashboard();
              }}
            />
          </div>
        ) : null}

        {activeTab === "products" ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <ProductForm
              editingProduct={editingProduct}
              onCancel={() => setEditingProduct(null)}
              onSaved={() => {
                setEditingProduct(null);
                loadDashboard();
              }}
            />
            <div className="section-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-brand-deep">Products</p>
              <div className="mt-4 space-y-3">
                {dashboard.products.length ? (
                  dashboard.products.map((product) => (
                    <div key={product.dbId || product.id} className="rounded-2xl bg-brand-cream p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-brand-deep">{product.name}</p>
                            <StatusBadge status={product.approvalStatus} />
                          </div>
                          <p className="mt-1 text-sm text-brand-slate/70">
                            {product.category} · {formatNaira(product.price)} · Stock {product.stock}
                          </p>
                          {product.rejectionReason ? (
                            <p className="mt-2 text-sm text-red-600">Rejected: {product.rejectionReason}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setActiveTab("products");
                          }}
                          className="button-secondary"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-brand-slate/75">No products submitted yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "orders" ? (
          <div className="section-card p-5 sm:p-6">
            <p className="text-lg font-semibold text-brand-deep">Sales / orders</p>
            <div className="mt-4 space-y-3">
              {dashboard.orders.length ? (
                dashboard.orders.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-brand-cream p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-semibold text-brand-deep">{order.orderNumber}</p>
                        <p className="mt-1 text-sm text-brand-slate/70">
                          {order.customerName} · {order.status} / {order.paymentStatus}
                        </p>
                        <p className="mt-2 text-sm text-brand-slate/70">
                          {order.items.map((item) => `${item.quantity} x ${item.name}`).join("; ")}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-brand-deep">{formatNaira(order.vendorTotal)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-brand-slate/75">No orders for your products yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function VendorGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <EmptyState title="Loading vendor workspace" copy="Checking your vendor session." />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Vendor sign-in required"
        copy="Use your approved vendor account to manage products and sales."
        actionLabel="Login"
        actionTo="/login"
      />
    );
  }

  if (user.role !== "vendor") {
    return (
      <EmptyState
        title="Vendor access only"
        copy="This workspace is reserved for approved SolarMart vendors."
        actionLabel="Go to vendor login"
        actionTo="/login"
      />
    );
  }

  return <VendorDashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-brand-cream bg-hero-grid text-brand-slate">
          <ScrollToTop />
          <VendorNavbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<VendorGate />} />
              <Route path="/login" element={<VendorAuthPage mode="login" />} />
              <Route path="/register" element={<VendorAuthPage mode="register" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
