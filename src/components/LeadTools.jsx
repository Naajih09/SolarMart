import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { company, formatNaira, getRecommendation, whatsappMessage } from "../site";

export function CalculatorCard() {
  const [monthlyBill, setMonthlyBill] = useState("");
  const parsedBill = Number(monthlyBill);
  const isValid = monthlyBill !== "" && Number.isFinite(parsedBill) && parsedBill > 0;
  const results = useMemo(() => {
    if (!isValid) {
      return null;
    }

    const yearlyCost = parsedBill * 12;
    const fiveYearCost = yearlyCost * 5;

    return {
      monthlyCost: parsedBill,
      yearlyCost,
      fiveYearCost,
      recommendation: getRecommendation(parsedBill),
    };
  }, [isValid, parsedBill]);

  return (
    <div className="section-card p-6 sm:p-8 lg:p-10">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
            NEPA Bill Calculator
          </p>
          <h3 className="mt-3 text-2xl font-bold text-brand-deep">
            Estimate your savings in seconds
          </h3>
        </div>

        <label className="block">
          <span className="mb-3 block text-sm font-semibold text-brand-slate">
            Monthly electricity bill (NGN)
          </span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="e.g. 85000"
            value={monthlyBill}
            onChange={(event) => setMonthlyBill(event.target.value)}
            className="w-full rounded-2xl border border-brand-slate/15 bg-brand-cream px-5 py-4 text-base outline-none transition focus:border-brand-green"
          />
        </label>

        {!isValid && monthlyBill !== "" ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Enter a valid amount greater than zero.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Monthly cost" value={results ? formatNaira(results.monthlyCost) : "NGN 0"} />
          <MetricCard label="Yearly cost" value={results ? formatNaira(results.yearlyCost) : "NGN 0"} />
          <MetricCard label="5-year cost" value={results ? formatNaira(results.fiveYearCost) : "NGN 0"} />
        </div>

        <div className="rounded-[1.75rem] bg-brand-deep p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">
            Solar recommendation
          </p>
          <p className="mt-4 text-base leading-7">
            {results ? results.recommendation : getRecommendation(0)}
          </p>
        </div>

        {results ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/quote" className="button-primary w-full sm:w-auto">
              Get Quote
            </Link>
            <a
              href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="button-secondary w-full sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[1.6rem] border border-brand-slate/10 bg-white p-5">
      <p className="text-sm text-brand-slate/70">{label}</p>
      <p className="mt-3 break-words text-2xl font-bold text-brand-deep">{value}</p>
    </div>
  );
}

export function LeadForm({ title, source }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    monthlyBill: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source,
          monthlyBill: formData.monthlyBill ? Number(formData.monthlyBill) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus({
        type: "success",
        message: "Thanks. Your request has been received and SolarMart will reach out soon.",
      });
      setFormData({
        name: "",
        phone: "",
        location: "",
        monthlyBill: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "We could not submit your request right now. Please try again or use WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="section-card p-6 sm:p-8 lg:p-10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-brand-deep">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-slate/75">
          Required fields help us respond faster with the right recommendation.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField
          label="Name"
          type="text"
          value={formData.name}
          required
          onChange={(value) => setFormData((current) => ({ ...current, name: value }))}
        />
        <FormField
          label="Phone"
          type="tel"
          value={formData.phone}
          required
          onChange={(value) => setFormData((current) => ({ ...current, phone: value }))}
        />
        <FormField
          label="Location"
          type="text"
          value={formData.location}
          required
          onChange={(value) => setFormData((current) => ({ ...current, location: value }))}
        />
        <FormField
          label="Monthly bill (optional)"
          type="number"
          inputMode="numeric"
          value={formData.monthlyBill}
          onChange={(value) => setFormData((current) => ({ ...current, monthlyBill: value }))}
        />

        {status.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-brand-green"
                : "bg-red-50 text-red-600"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

function FormField({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-brand-slate">{label}</span>
      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-brand-slate/15 bg-brand-cream px-5 py-4 outline-none transition focus:border-brand-green"
      />
    </label>
  );
}

export function ContactItem({ label, value, href }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block rounded-[1.7rem] bg-brand-cream p-5 transition hover:bg-brand-yellow/30"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">{label}</p>
      <p className="mt-2 text-lg font-semibold text-brand-deep">{value}</p>
    </a>
  );
}
