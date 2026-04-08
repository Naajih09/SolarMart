import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import { apiFetch } from "../../lib/api";
import { EmptyState, OrderSummary, CheckoutField } from "./SharedPageParts";

export function CheckoutPage() {
  const { cart, totals, referralCode } = useStore();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await apiFetch("/api/store?action=checkout", {
        method: "POST",
        body: JSON.stringify({
          customer: form,
          items: cart,
          referralCode,
          createAccount,
          password: createAccount ? password : undefined,
        }),
      });

      setStatus({ type: "success", message: data.message });
      window.location.href = data.paymentUrl;
    } catch (error) {
      setStatus({ type: "error", message: error.message });
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
          <label className="flex items-center gap-3 rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-slate">
            <input type="checkbox" checked={createAccount} onChange={(event) => setCreateAccount(event.target.checked)} />
            Create an account after checkout
          </label>
          {createAccount ? (
            <CheckoutField label="Set password" type="password" value={password} onChange={setPassword} required />
          ) : null}
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
        <OrderSummary subtotal={totals.subtotal} delivery={totals.delivery} total={totals.total} />
      </div>
    </section>
  );
}

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useStore();
  const [state, setState] = useState({ loading: true, message: "Verifying payment..." });

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setState({ loading: false, message: "Missing payment reference." });
      return;
    }

    apiFetch("/api/store?action=verify", {
      method: "POST",
      body: JSON.stringify({ reference }),
    })
      .then((data) => {
        clearCart();
        setState({
          loading: false,
          message: `Payment verified. Order ${data.orderNumber} has been created successfully.`,
        });
      })
      .catch((error) => {
        setState({ loading: false, message: error.message });
      });
  }, [clearCart, params]);

  return (
    <section className="py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl section-card p-8 text-center">
          <h1 className="text-3xl font-bold text-brand-deep">Checkout status</h1>
          <p className="mt-4 text-base leading-7 text-brand-slate/75">{state.message}</p>
          {!state.loading ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => navigate("/dashboard")} className="button-primary">
                Go to dashboard
              </button>
              <Link to="/products" className="button-secondary">
                Continue shopping
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function AuthPage({ mode, context = "store" }) {
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const isRegister = mode === "register";
  const isAdminContext = context === "admin";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-xl section-card p-6 sm:p-8">
          <span className="eyebrow">
            {isRegister ? "Customer Register" : isAdminContext ? "Admin Login" : "Customer Login"}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-brand-deep">
            {isRegister
              ? "Create your SolarMart customer account"
              : isAdminContext
                ? "Sign in to the SolarMart admin workspace"
                : "Sign in to your SolarMart account"}
          </h1>
          <p className="mt-3 text-base leading-7 text-brand-slate/75">
            {isRegister
              ? "Create an account to manage orders, speed up checkout, and track your purchases."
              : isAdminContext
                ? "Use your approved admin account to manage products, orders, and partner applications."
                : "Access your orders, account details, and store activity."}
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <CheckoutField label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} required />
            ) : null}
            <CheckoutField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
            {isRegister ? (
              <CheckoutField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
            ) : null}
            <CheckoutField label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} required />
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
            <button type="submit" className="button-primary w-full">
              {isRegister ? "Create account" : "Login"}
            </button>
            {!isAdminContext ? (
              <p className="text-center text-sm text-brand-slate/70">
                {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                <Link
                  to={isRegister ? "/login" : "/register"}
                  className="font-semibold text-brand-green hover:text-brand-deep"
                >
                  {isRegister ? "Login here" : "Sign up here"}
                </Link>
              </p>
            ) : null}
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
