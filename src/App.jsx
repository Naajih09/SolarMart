import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  benefits,
  navLinks,
  packages,
  painPoints,
  processSteps,
  testimonials,
} from "./data";

const company = {
  name: "SolarMart",
  tagline: "Reliable Solar Power Solutions",
  phone: "+234 801 234 5678",
  email: "hello@solarmart.energy",
  whatsappNumber: "2348012345678",
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const whatsappMessage = encodeURIComponent(
  "Hello SolarMart, I calculated my electricity cost and I want a solar quote.",
);

function formatNaira(value) {
  return currency.format(Number(value || 0));
}

function getRecommendation(monthlyBill) {
  if (!monthlyBill || monthlyBill <= 0) {
    return "Enter your monthly bill to see the right solar recommendation.";
  }

  if (monthlyBill < 40000) {
    return "The 3kVA package is a strong starting point for smaller homes with essential appliances.";
  }

  if (monthlyBill < 120000) {
    return "The 5kVA package is likely the best fit for a family home or small business with moderate daily use.";
  }

  return "The 10kVA package is the best fit for heavier energy demand, offices, and businesses that need reliable all-day power.";
}

function App() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-slate">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-slate/10 bg-brand-cream/90 backdrop-blur">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green text-lg font-bold text-white">
            S
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-deep">{company.name}</p>
            <p className="text-xs text-brand-slate/75">{company.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-brand-green" : "text-brand-slate hover:text-brand-green"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-slate/10 bg-white text-brand-deep lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? "×" : "≡"}
          </button>
          <Link to="/quote" className="button-primary shrink-0">
            Request Quote
          </Link>
        </div>
      </div>
      {isOpen ? (
        <div className="section-shell pb-4 lg:hidden">
          <nav className="section-card grid gap-1 p-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-green text-white"
                      : "text-brand-slate hover:bg-brand-cream"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <CalculatorHighlight />
      <PackagesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaBanner />
      <LeadSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="overflow-hidden bg-hero-grid">
      <div className="section-shell grid gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="space-y-8">
          <span className="eyebrow">Solar power for homes and businesses</span>
          <div className="space-y-5">
            <h1 className="max-w-2xl text-5xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
              Stop Paying NEPA Bills
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-brand-slate/80">
              Switch to Solar with SolarMart and enjoy clean, quiet power that protects
              your comfort, productivity, and budget.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/calculator" className="button-primary">
              Calculate Your Savings
            </Link>
            <Link to="/quote" className="button-secondary">
              Get Solar Quote
            </Link>
          </div>
          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              ["24/7 confidence", "Reliable backup power for outages"],
              ["Lower energy spend", "See what your current bill really costs over time"],
              ["Tailored installation", "Right-sized systems for homes, offices, and shops"],
            ].map(([title, copy]) => (
              <div key={title} className="section-card p-5">
                <p className="font-semibold text-brand-deep">{title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-slate/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-yellow/30 blur-3xl" />
          <div className="relative space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                Energy Snapshot
              </p>
              <h2 className="mt-3 text-3xl font-bold text-brand-deep">
                Your current power costs may be higher than you think.
              </h2>
            </div>
            <div className="grid gap-4">
              {[
                ["NEPA bill", "Monthly spending that keeps increasing"],
                ["Generator fuel", "Hidden daily cost many homes ignore"],
                ["Business downtime", "Power outages that affect sales and service"],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="flex items-start justify-between rounded-3xl border border-brand-slate/10 bg-brand-cream p-5"
                >
                  <div>
                    <p className="font-semibold text-brand-deep">{title}</p>
                    <p className="mt-1 text-sm text-brand-slate/70">{value}</p>
                  </div>
                  <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-deep">
                    Cost driver
                  </span>
                </div>
              ))}
            </div>
            <Link to="/quote" className="button-primary w-full">
              Start Your Solar Journey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell section-card grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
        <div className="space-y-4">
          <span className="eyebrow">The problem</span>
          <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
            Expensive, unstable electricity makes every month harder.
          </h2>
          <p className="text-base leading-7 text-brand-slate/75">
            SolarMart helps you replace unreliable power with a cleaner system built for
            daily life in Nigeria.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {painPoints.map((item) => (
            <div key={item} className="rounded-[1.8rem] bg-brand-deep p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">
                Challenge
              </p>
              <p className="mt-4 text-lg leading-7">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalculatorHighlight() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <span className="eyebrow">Instant conversion tool</span>
          <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
            See how much your electricity really costs over time.
          </h2>
          <p className="max-w-xl text-base leading-7 text-brand-slate/75">
            Enter your monthly electricity bill and we will estimate what you spend in a
            year and over five years, then recommend the right next step.
          </p>
          <div className="space-y-3">
            {[
              "Instant Naira formatting and validation",
              "Solar recommendation after calculation",
              "Direct quote and WhatsApp follow-up actions",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white">
                  +
                </span>
                <p className="text-sm font-medium text-brand-slate">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <CalculatorCard />
      </div>
    </section>
  );
}

function CalculatorCard() {
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
    <div className="section-card p-8 sm:p-10">
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
            Monthly electricity bill (₦)
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
          <MetricCard label="Monthly cost" value={results ? formatNaira(results.monthlyCost) : "₦0"} />
          <MetricCard label="Yearly cost" value={results ? formatNaira(results.yearlyCost) : "₦0"} />
          <MetricCard label="5-year cost" value={results ? formatNaira(results.fiveYearCost) : "₦0"} />
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
            <Link to="/quote" className="button-primary">
              Get Quote
            </Link>
            <a
              href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="button-secondary"
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
      <p className="mt-3 text-2xl font-bold text-brand-deep">{value}</p>
    </div>
  );
}

function PackagesSection() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="eyebrow">Solar packages</span>
            <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
              Packages designed for different energy needs
            </h2>
          </div>
          <Link to="/packages" className="button-secondary">
            Explore All Packages
          </Link>
        </div>
        <PackageGrid />
      </div>
    </section>
  );
}

function PackageGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {packages.map((item) => (
        <article key={item.title} className="section-card flex h-full flex-col p-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-brand-deep">{item.title}</h3>
            <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-deep">
              Popular
            </span>
          </div>
          <p className="text-base leading-7 text-brand-slate/75">{item.summary}</p>
          <div className="mt-6 space-y-4 text-sm text-brand-slate">
            <PackageDetail label="System size" value={item.systemSize} />
            <PackageDetail label="Battery info" value={item.battery} />
            <PackageDetail label="Best for" value={item.appliances} />
          </div>
          <Link to="/quote" className="button-primary mt-8 w-full">
            Request This Package
          </Link>
        </article>
      ))}
    </div>
  );
}

function PackageDetail({ label, value }) {
  return (
    <div className="rounded-2xl bg-brand-cream p-4">
      <p className="font-semibold text-brand-deep">{label}</p>
      <p className="mt-1 leading-6 text-brand-slate/75">{value}</p>
    </div>
  );
}

function BenefitsSection() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell section-card p-8 lg:p-12">
        <div className="mb-8 max-w-2xl space-y-4">
          <span className="eyebrow">Why switch</span>
          <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
            Reliable solar changes how you live and work.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-[1.7rem] bg-brand-green p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">
                Benefit
              </p>
              <p className="mt-4 text-lg leading-7">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell space-y-8">
        <div className="space-y-4">
          <span className="eyebrow">Testimonials</span>
          <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
            Customers already enjoying dependable solar power
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="section-card p-7">
              <p className="text-base leading-7 text-brand-slate/75">“{item.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold text-brand-deep">{item.name}</p>
                <p className="text-sm text-brand-slate/70">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-[2rem] bg-brand-deep px-8 py-10 text-center text-white">
          <p className="text-2xl font-bold">Join Our Happy Customers</p>
          <Link to="/quote" className="button-primary mt-5">
            Request Your Quote
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-8 lg:py-14">
      <div className="section-shell">
        <div className="overflow-hidden rounded-[2rem] bg-brand-yellow px-8 py-10 shadow-soft lg:flex lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/75">
              Ready to move
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-deep sm:text-4xl">
              Stop Paying NEPA Forever
            </h2>
          </div>
          <Link to="/calculator" className="button-primary mt-6 lg:mt-0">
            See Your Savings
          </Link>
        </div>
      </div>
    </section>
  );
}

function LeadSection() {
  return (
    <section className="py-8 pb-16 lg:py-14 lg:pb-24">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <span className="eyebrow">Lead form</span>
          <h2 className="text-3xl font-bold text-brand-deep sm:text-4xl">
            Let’s help you plan the right solar system.
          </h2>
          <p className="text-base leading-7 text-brand-slate/75">
            Share your details and we will reach out with the next best package and
            quote options for your location and electricity spend.
          </p>
        </div>
        <LeadForm title="Request a callback" source="homepage-form" />
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <SimplePageShell
      eyebrow="About SolarMart"
      title="We make the switch to reliable solar simple and practical."
      intro="SolarMart is focused on helping homes, offices, and small businesses reduce power costs with dependable solar solutions tailored to local realities."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          "Transparent guidance from first conversation to installation",
          "Solar packages sized around how people actually use power",
          "Fast response for quote requests and WhatsApp enquiries",
        ].map((item) => (
          <div key={item} className="section-card p-6">
            <p className="text-lg font-semibold text-brand-deep">{item}</p>
          </div>
        ))}
      </div>
    </SimplePageShell>
  );
}

function PackagesPage() {
  return (
    <SimplePageShell
      eyebrow="Packages"
      title="Choose a package that matches your current energy demand."
      intro="Every package can be fine-tuned based on your appliances, usage pattern, and backup expectations."
    >
      <PackageGrid />
    </SimplePageShell>
  );
}

function HowItWorksPage() {
  return (
    <SimplePageShell
      eyebrow="How it works"
      title="A clear path from high power bills to reliable solar."
      intro="We keep the process straightforward so you can make an informed decision without stress."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {processSteps.map((step, index) => (
          <div key={step.title} className="section-card p-7">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
              Step {index + 1}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-brand-deep">{step.title}</h3>
            <p className="mt-4 text-base leading-7 text-brand-slate/75">{step.description}</p>
          </div>
        ))}
      </div>
    </SimplePageShell>
  );
}

function CalculatorPage() {
  return (
    <SimplePageShell
      eyebrow="Calculator"
      title="Estimate your electricity spending before you commit to solar."
      intro="Use the calculator below to understand your monthly, yearly, and five-year power cost in Naira."
    >
      <CalculatorCard />
    </SimplePageShell>
  );
}

function ContactPage() {
  return (
    <SimplePageShell
      eyebrow="Contact"
      title="Speak with SolarMart about your home, shop, or office power needs."
      intro="Reach us directly or send your details through the form and we will follow up quickly."
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="section-card p-7">
          <div className="space-y-5">
            <ContactItem label="Phone" value={company.phone} href={`tel:${company.phone}`} />
            <ContactItem label="Email" value={company.email} href={`mailto:${company.email}`} />
            <ContactItem
              label="WhatsApp"
              value="Chat instantly on WhatsApp"
              href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            />
          </div>
        </div>
        <LeadForm title="Contact SolarMart" source="contact-page" />
      </div>
    </SimplePageShell>
  );
}

function QuotePage() {
  return (
    <SimplePageShell
      eyebrow="Quote Request"
      title="Request a tailored solar quote in a few quick steps."
      intro="Tell us where you are and how much you currently spend on electricity so we can suggest the right package."
    >
      <LeadForm title="Get your solar quote" source="quote-page" />
    </SimplePageShell>
  );
}

function SimplePageShell({ eyebrow, title, intro, children }) {
  return (
    <section className="py-14 lg:py-20">
      <div className="section-shell space-y-8">
        <div className="max-w-3xl space-y-4">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
            {title}
          </h1>
          <p className="text-base leading-8 text-brand-slate/75">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function ContactItem({ label, value, href }) {
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

function LeadForm({ title, source }) {
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
    <div className="section-card p-8 sm:p-10">
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

        <button type="submit" disabled={isSubmitting} className="button-primary w-full disabled:opacity-60">
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

function Footer() {
  return (
    <footer className="border-t border-brand-slate/10 bg-white">
      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div>
          <p className="text-2xl font-bold text-brand-deep">{company.name}</p>
          <p className="mt-2 text-sm text-brand-slate/75">{company.tagline}</p>
        </div>
        <div className="space-y-2 text-sm text-brand-slate/75">
          <a className="block hover:text-brand-green" href={`tel:${company.phone}`}>
            {company.phone}
          </a>
          <a
            className="block hover:text-brand-green"
            href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a className="block hover:text-brand-green" href={`mailto:${company.email}`}>
            {company.email}
          </a>
        </div>
        <Link to="/quote" className="button-primary">
          Request Quote
        </Link>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${company.whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-deep"
    >
      WhatsApp
    </a>
  );
}

export default App;
