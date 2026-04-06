import { Link } from "react-router-dom";
import {
  benefits,
  packages,
  painPoints,
  processSteps,
  testimonials,
} from "../data";
import { company, whatsappMessage } from "../site";
import { SimplePageShell } from "./Layout";
import { CalculatorCard, ContactItem, LeadForm } from "./LeadTools";

export function HomePage() {
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
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-24">
        <div className="space-y-8">
          <span className="eyebrow">Solar power for homes and businesses</span>
          <div className="space-y-5">
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl lg:text-6xl">
              Stop Paying NEPA Bills
            </h1>
            <p className="max-w-2xl text-base leading-7 text-brand-slate/80 sm:text-lg sm:leading-8">
              Switch to Solar with SolarMart and enjoy clean, quiet power that protects
              your comfort, productivity, and budget.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/calculator" className="button-primary w-full sm:w-auto">
              Calculate Your Savings
            </Link>
            <Link to="/quote" className="button-secondary w-full sm:w-auto">
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

        <div className="section-card relative overflow-hidden p-6 sm:p-8 lg:p-10">
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
                <div key={title} className="rounded-3xl border border-brand-slate/10 bg-brand-cream p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-brand-deep">{title}</p>
                      <p className="mt-1 text-sm text-brand-slate/70">{value}</p>
                    </div>
                    <span className="w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-deep">
                      Cost driver
                    </span>
                  </div>
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
      <div className="section-shell section-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
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
    <section className="py-8 lg:py-14" id="calculator">
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
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
          <Link to="/packages" className="button-secondary w-full sm:w-auto">
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
        <article key={item.title} className="section-card flex h-full flex-col p-6 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
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
      <div className="section-shell section-card p-6 sm:p-8 lg:p-12">
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
              <p className="text-base leading-7 text-brand-slate/75">"{item.quote}"</p>
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
        <div className="overflow-hidden rounded-[2rem] bg-brand-yellow px-6 py-8 shadow-soft sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/75">
              Ready to move
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-deep sm:text-4xl">
              Stop Paying NEPA Forever
            </h2>
          </div>
          <Link to="/calculator" className="button-primary mt-6 w-full sm:w-auto lg:mt-0">
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
            Let's help you plan the right solar system.
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

export function AboutPage() {
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

export function PackagesPage() {
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

export function HowItWorksPage() {
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

export function CalculatorPage() {
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

export function ContactPage() {
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

export function QuotePage() {
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
