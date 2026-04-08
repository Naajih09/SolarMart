import { Link } from "react-router-dom";
import { formatNaira } from "../../site";
import { ProductCard } from "../commerce-ui";

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
  gridClassName = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
}) {
  if (loading) {
    return <ProductSkeletonGrid gridClassName={gridClassName} />;
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
    <div className={gridClassName}>
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductSkeletonGrid({ gridClassName }) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft"
        >
          <div className="aspect-[4/3] animate-pulse bg-brand-cream" />
          <div className="space-y-4 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-brand-cream" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-brand-cream" />
            <div className="h-4 w-full animate-pulse rounded-full bg-brand-cream" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-brand-cream" />
            <div className="h-10 rounded-full bg-brand-cream animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-brand-slate/10 bg-white/75 p-3 backdrop-blur sm:p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-slate/60">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-brand-deep sm:text-lg">{value}</p>
    </div>
  );
}

export function StatsCard({ label, value }) {
  return (
    <div className="surface-dark p-4 sm:p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-brand-yellow/90">{label}</p>
      <p className="mt-3 break-words text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function OrderSummary({ subtotal, delivery, total }) {
  return (
    <aside className="glass-panel h-fit p-5 lg:sticky lg:top-24">
      <p className="text-lg font-bold text-brand-deep sm:text-xl">Order summary</p>
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
    <div className="glass-panel p-5 sm:p-6">
      <p className="text-lg font-semibold text-brand-deep">{title}</p>
      <div className="mt-4 space-y-3 md:hidden">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={`${title}-mobile-${index}`} className="rounded-2xl border border-brand-slate/10 bg-brand-cream p-4">
              <div className="space-y-3">
                {row.map((value, cellIndex) => (
                  <div key={`${title}-mobile-${index}-${cellIndex}`} className="flex items-start justify-between gap-4 text-sm">
                    <span className="font-semibold text-brand-slate/70">{headers[cellIndex]}</span>
                    <span className="text-right text-brand-deep">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-brand-slate/70">No records yet.</p>
        )}
      </div>
      <div className="mt-4 hidden overflow-x-auto md:block">
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
        <div className="mx-auto max-w-2xl glass-panel p-6 text-center sm:p-8">
          <h1 className="text-2xl font-bold text-brand-deep sm:text-3xl">{title}</h1>
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
