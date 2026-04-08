import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatNaira } from "../../site";

export function CheckoutField({ label, onChange, ...props }) {
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

export function ProductGrid({
  items,
  loading,
  emptyTitle = "No products yet",
  emptyCopy = "The marketplace is now database-driven. Add products from the admin dashboard and they will appear here automatically.",
}) {
  const { addToCart } = useStore();

  if (loading) {
    return <EmptyState title="Loading products" copy="Fetching the latest catalogue from the store." />;
  }

  if (!items.length) {
    return (
      <div className="section-card p-8 text-center">
        <h2 className="text-2xl font-bold text-brand-deep">{emptyTitle}</h2>
        <p className="mt-3 text-base leading-7 text-brand-slate/75">{emptyCopy}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {items.map((product) => (
        <article key={product.id} className="section-card overflow-hidden transition duration-300 hover:-translate-y-1">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 items-center justify-center bg-brand-cream px-6 text-center text-sm font-semibold text-brand-slate/65">
              Product image coming soon
            </div>
          )}
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-green">{product.category}</p>
                <h3 className="mt-1 text-xl font-bold text-brand-deep">{product.name}</h3>
              </div>
              <span className="rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-deep">
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

export function DetailCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-brand-slate/10 bg-white/75 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-slate/60">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-brand-deep">{value}</p>
    </div>
  );
}

export function StatsCard({ label, value }) {
  return (
    <div className="surface-dark p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-brand-yellow/90">{label}</p>
      <p className="mt-3 break-words text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export function OrderSummary({ subtotal, delivery, total }) {
  return (
    <aside className="glass-panel h-fit p-6">
      <p className="text-xl font-bold text-brand-deep">Order summary</p>
      <div className="mt-5 space-y-3 text-sm text-brand-slate/75">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery</span>
          <span>{formatNaira(delivery)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-brand-slate/10 pt-3 text-base font-semibold text-brand-deep">
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </div>
      </div>
      <Link to="/checkout" className="button-primary mt-6 w-full">
        Continue to checkout
      </Link>
    </aside>
  );
}

export function AdminTable({ title, headers, rows }) {
  return (
    <div className="glass-panel p-6">
      <p className="text-lg font-semibold text-brand-deep">{title}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-brand-slate/70">
            <tr>
              {headers.map((header) => (
                <th key={header} className="py-3 pr-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-brand-slate/10">
                {row.map((value, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="py-3 pr-4">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ title, copy, actionLabel, actionTo }) {
  return (
    <section className="py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl glass-panel p-8 text-center">
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
