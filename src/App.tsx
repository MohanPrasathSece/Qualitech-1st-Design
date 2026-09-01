import { useEffect, useState, useRef } from "react";

import heroHarness from "@/assets/hero-harness.jpg";
import aboutFactory from "@/assets/about-factory.jpg";
import cardCable from "@/assets/card-cable-assemblies.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";
import indPower from "@/assets/ind-power.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indRailways from "@/assets/ind-railways.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";

import { Counter, Reveal } from "@/components/site/reveal";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ShopPage } from "@/pages/ShopPage";
import { AboutPage } from "@/pages/AboutPage";
import { ManufacturingPage } from "@/pages/ManufacturingPage";
import { AmphenolPage } from "@/pages/AmphenolPage";
import { ContactPage } from "@/pages/ContactPage";

export default Home;

/* ─── Hero ─── */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-background pt-28 lg:pt-36">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="label-eyebrow">Established 1995</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-graphite sm:text-5xl lg:text-6xl">
              Precision Connections.
              <span className="block text-brand-blue">Engineered for Performance.</span>
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-6 max-w-xl font-display text-base font-semibold text-graphite sm:text-lg">
              Distribution of Electronics Components &amp; Manufacturing of Cable Assemblies
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
              Qualitech Connectronics delivers high-quality electronics components from trusted brands like Amphenol and Zolex, along with custom-built wire and cable harnesses for OEM applications.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#business"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-graphite px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm"
              >
                Explore Our Solutions
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-graphite/20 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite transition-all duration-300 hover:border-graphite hover:bg-graphite/5"
              >
                Request a Quote
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
            <img
              src={heroHarness}
              alt="Custom wire harness with precision multi-pin connectors"
              width={1200}
              height={1408}
              className="h-[420px] w-full object-cover sm:h-[500px] lg:h-[560px]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Stats ─── */

const STATS = [
  { value: 1995, label: "Established", plain: true },
  { value: 30, suffix: "+", label: "Years of Experience" },
  { text: "OEM", label: "Focused Solutions" },
  { value: 2, label: "Business Verticals" },
  { value: 4, label: "Key Industries" },
];

function Stats() {
  return (
    <section className="border-y border-border/80 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/80 px-5 sm:px-8 lg:grid-cols-5">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 90}
            className="px-4 py-8 text-center sm:py-10"
          >
            <div className="font-display text-3xl font-bold tabular-nums text-graphite sm:text-4xl">
              {stat.text ? (
                stat.text
              ) : stat.plain ? (
                <Counter value={stat.value as number} duration={1} />
              ) : (
                <Counter value={stat.value as number} suffix={stat.suffix} />
              )}
            </div>
            <div className="mx-auto mt-3 h-0.5 w-6 bg-brand-blue" />
            <p className="mt-3 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Business Structure (NEW — Prominent Section) ─── */

function BusinessStructure() {
  return (
    <section id="business" className="surface-steel border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">What We Do</span>
          </div>
          <h2 className="mt-7 max-w-3xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl lg:text-[2.75rem]">
            Two Focused Business Areas
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Qualitech Connectronics operates in two core verticals — delivering both world-class electronics components and custom-engineered cable assembly solutions.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Card 01: Distribution */}
          <Reveal delay={100}>
            <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
              <span className="absolute inset-x-0 top-0 z-10 h-1 w-0 rounded-t-2xl bg-brand-blue transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />

              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 font-display text-lg font-bold text-brand-blue">
                    01
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-graphite sm:text-2xl">
                      Distribution of Electronics Components
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
                  Authorized distribution of premium electronics components from trusted global brands for industrial and OEM applications.
                </p>

                {/* Partner Brand Cards */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {/* Amphenol */}
                  <a
                    href="https://www.amphenol-cs.com/product-series/gnss.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/card flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-all duration-300 hover:border-[#004f9e]/40 hover:shadow-md"
                  >
                    <svg className="h-8 w-8 text-[#004f9e] shrink-0" viewBox="0 0 32 32" fill="currentColor">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 16c2-6 6-6 8 0s6 6 8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base font-extrabold text-[#004f9e]">Amphenol</span>
                      <p className="text-[0.68rem] text-muted-foreground">View Products →</p>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Zolex */}
                  <a
                    href="https://zolex.in/product/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/card flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-all duration-300 hover:border-brand-blue/40 hover:shadow-md"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white font-display font-extrabold text-xs shrink-0">
                      Z
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base font-extrabold text-graphite">Zolex</span>
                      <p className="text-[0.68rem] text-muted-foreground">View Products →</p>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Card 02: Manufacturing */}
          <Reveal delay={200}>
            <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
              <span className="absolute inset-x-0 top-0 z-10 h-1 w-0 rounded-t-2xl bg-brand-yellow transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />

              <div className="overflow-hidden">
                <img
                  src={cardCable}
                  alt="Custom cable assembly manufacturing"
                  loading="lazy"
                  width={900}
                  height={500}
                  className="h-52 w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110"
                />
              </div>

              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/20 font-display text-lg font-bold text-graphite">
                    02
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-graphite sm:text-2xl">
                      Manufacturing of Cable Assemblies
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
                  Custom wire and cable harness solutions — designed, manufactured and 100% tested to your exact OEM specifications.
                </p>

                <ul className="mt-5 space-y-2">
                  {["Custom Cable Assemblies", "Wire Harnesses", "Application-specific Assemblies", "OEM Requirements"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-brand-yellow shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="group/btn mt-7 inline-flex items-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite"
                >
                  Discuss Your Requirement
                  <span className="h-px w-8 bg-graphite transition-all duration-300 group-hover/btn:w-14" />
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="label-eyebrow">About Qualitech</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-7 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl lg:text-[2.75rem]">
              Built on Experience.
              <span className="block text-steel">Driven by Precision.</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-7 space-y-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              <p>
                Qualitech was established in 1995 by a team of dedicated professionals. Having
                successfully managed the company for nearly three decades, Qualitech is now a trusted name in
                distribution of electronics components and manufacturing of high quality custom built
                wire and cable harnesses for OEMs.
              </p>
              <p>
                The right combination of dedicated and excellent manpower along with the latest
                technology, is not only helping the company provide the most highly reliable cable
                harnesses but also helping in resource optimization.
              </p>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <a
              href="#business"
              className="group mt-9 inline-flex items-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite"
            >
              Discover Our Solutions
              <span className="h-px w-8 bg-graphite transition-all duration-300 group-hover:w-14" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-steel-light">
              <img
                src={aboutFactory}
                alt="Wire harness assembly team working on the Qualitech production floor"
                loading="lazy"
                width={1408}
                height={1008}
                className="h-[380px] w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-precise)] hover:scale-[1.04] sm:h-[520px] lg:h-[640px]"
              />
            </div>
            <div className="absolute -bottom-6 left-6 hidden rounded-xl bg-background px-8 py-6 shadow-[var(--shadow-panel)] sm:block">
              <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Manufacturing since
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-graphite">1995</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Industries ─── */

const INDUSTRIES = [
  { name: "Telecommunications", desc: "Reliable connectivity for telecom infrastructure and equipment.", image: indTelecom },
  { name: "Power", desc: "High-reliability wiring solutions for power distribution and generation.", image: indPower },
  { name: "Defence", desc: "Ruggedized, high-specification cable assemblies for defence applications.", image: indDefense },
  { name: "Railways", desc: "Robust wiring systems for railway signalling and rolling stock.", image: indRailways },
];

function Industries() {
  return (
    <section id="industries" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-brand-orange" />
          <span className="label-eyebrow">Industries We Serve</span>
        </div>
        <h2 className="mt-7 max-w-2xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
          Solutions for Critical Industries
        </h2>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Our diversified clientele reflects our strength in supplying application-specific and
          customized products for demanding sectors.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {INDUSTRIES.map((item, i) => (
          <Reveal key={item.name} delay={i * 100}>
            <div className="group relative overflow-hidden rounded-2xl bg-graphite">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                width={800}
                height={1000}
                className="h-[340px] w-full object-cover opacity-85 transition-all duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110 group-hover:opacity-100 lg:h-[420px]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-graphite-deep/85 via-graphite-deep/10 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="block h-px w-8 bg-brand-yellow transition-all duration-500 group-hover:w-16" />
                <h3 className="mt-4 font-display text-lg font-bold text-background">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-light/80">{item.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Why Qualitech ─── */

const WHY = [
  { title: "Application-Specific Solutions", copy: "Every product is designed and built to your exact application and specification requirements." },
  { title: "Quality Focused", copy: "100% electrically tested harnesses with stringent quality checks at every stage of production." },
  { title: "Experienced Team", copy: "Over 30 years of cumulative expertise in wire harnessing, connectors and cable assembly." },
  { title: "Competitive Solutions", copy: "Resource optimization and efficient processes deliver the best value for our customers." },
  { title: "Timely Supply", copy: "Reliable delivery schedules to support your production timelines and OEM requirements." },
];

function Why() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">Why Qualitech</span>
          </div>
          <h2 className="mt-7 max-w-2xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
            The Right Partner for Your OEM Requirements
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Providing high quality harnesses at competitive prices and timely supplies has been
            Qualitech's motto, which has helped the company grow from strength to strength.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-5">
          {WHY.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="group bg-background p-7">
              <h3 className="font-display text-base font-bold text-graphite">{item.title}</h3>
              <span className="mt-4 block h-px w-6 bg-border transition-all duration-500 group-hover:w-12 group-hover:bg-brand-blue" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Facilities Preview ─── */

function FacilitiesPreview() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("facilities");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      setOffset(Math.max(-1, Math.min(1, progress * 2 - 1)) * 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="facilities" className="relative overflow-hidden bg-graphite-deep">
      <img
        src={facilitiesWide}
        alt="Cable harness manufacturing facility with precision machinery"
        loading="lazy"
        width={1600}
        height={912}
        style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.08)` }}
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-graphite-deep/90 via-graphite-deep/60 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:py-40">
        <Reveal className="max-w-xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow text-steel">Facilities</span>
          </div>
          <h2 className="mt-7 font-display text-3xl font-bold leading-tight text-background sm:text-4xl lg:text-5xl">
            Technology Meets Expertise
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-steel">
            Our modern manufacturing environment combines advanced equipment with experienced
            craftsmanship to deliver precision-engineered connectivity solutions.
          </p>
          <a
            href="#contact"
            className="group mt-10 inline-flex items-center gap-3 rounded-xl border border-background/35 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:border-background"
          >
            Explore Our Facilities
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Products Overview (replaces old Product Catalogue) ─── */

interface ProductsOverviewProps {
  onNavigateToProducts?: () => void;
}

function ProductsOverview({ onNavigateToProducts }: ProductsOverviewProps) {
  return (
    <section id="shop" className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-yellow" />
                <span className="label-eyebrow">Our Products & Services</span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                Solutions You Can Trust
              </h2>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
                From globally trusted electronics component brands to custom-engineered cable assemblies — explore our complete product and service offerings.
              </p>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="self-start sm:self-auto rounded-xl bg-graphite px-6 py-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              View All Products & Services →
            </button>
          </div>
        </Reveal>

        {/* Two Column Product Preview */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal delay={100}>
            <a
              href="https://www.amphenol-cs.com/product-series/gnss.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-64 overflow-hidden rounded-2xl border border-border bg-graphite-deep transition-all duration-500 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#004f9e]/90 via-graphite-deep/80 to-transparent" />
              <div className="relative flex flex-col justify-end p-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60">
                  Distribution
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  Electronics Components
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Amphenol · Zolex
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brand-yellow transition-transform duration-300 group-hover:translate-x-2">
                  View Amphenol Products
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </div>
            </a>
          </Reveal>

          <Reveal delay={200}>
            <div className="group relative flex h-64 overflow-hidden rounded-2xl border border-border bg-graphite-deep transition-all duration-500 hover:shadow-[var(--shadow-lift)]">
              <img
                src={cardFacilities}
                alt="Cable assembly manufacturing"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-graphite-deep/85 via-graphite-deep/60 to-transparent" />
              <div className="relative flex flex-col justify-end p-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60">
                  Manufacturing
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  Cable Assemblies
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Custom wire harnesses · OEM solutions
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brand-yellow transition-transform duration-300 group-hover:translate-x-2">
                  Discuss Your Requirement →
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */

function FinalCTA() {
  return (
    <section id="contact" className="border-t border-border bg-white py-20 lg:py-28">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">Get in Touch</span>
          </div>
          <h2 className="mt-5 max-w-xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl lg:text-5xl">
            Ready to Discuss Your Requirements?
          </h2>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
            Whether you need electronics components or a custom cable assembly solution — our team is here to help.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:info@qualitechindia.in"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-graphite px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm"
            >
              Request a Quote
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="tel:+914027140004"
              className="group inline-flex items-center justify-center gap-3 rounded-xl border border-graphite/20 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite transition-all duration-300 hover:border-graphite hover:bg-graphite/5"
            >
              Contact Us
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="label-eyebrow">Direct Line</p>
            <a
              href="tel:+914027140004"
              className="mt-2 block font-display text-2xl font-bold text-graphite transition-colors duration-300 hover:text-brand-blue sm:text-3xl"
            >
              +91-40-27140004
            </a>
            {/* TODO: Add Gopi Sir's contact number once provided by client */}
            <p className="label-eyebrow mt-6">Email</p>
            <a
              href="mailto:info@qualitechindia.in"
              className="mt-2 block font-display text-xl font-bold text-brand-blue transition-colors duration-300 hover:text-graphite sm:text-2xl"
            >
              info@qualitechindia.in
            </a>
            <p className="label-eyebrow mt-6">Address</p>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold text-graphite">Qualitech Connectronics Private Limited</p>
              <p>Plot No. 37/B, Phase-V, IDA, Cherlapally,</p>
              <p>Hyderabad, Medchal-Malkajgiri,</p>
              <p>Telangana – 500051</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}



/* ─── Root App Component & Multi-Page Router ─── */

type PageType = "home" | "products" | "about" | "manufacturing" | "amphenol" | "contact";

function Home() {
  const getPageFromHash = (): PageType => {
    if (typeof window === "undefined") return "home";
    const hash = window.location.hash.toLowerCase();
    if (hash === "#products" || hash === "#shop") return "products";
    if (hash === "#about-page" || hash === "#about-us") return "about";
    if (hash === "#manufacturing" || hash === "#cable-assemblies") return "manufacturing";
    if (hash === "#amphenol") return "amphenol";
    if (hash === "#contact-page" || hash === "#contact-us") return "contact";
    return "home";
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromHash);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const handleNavigate = (target: string, isPage?: boolean) => {
    const cleanTarget = target.toLowerCase();

    if (cleanTarget === "#products" || cleanTarget === "#shop") {
      setCurrentPage("products");
      window.history.pushState(null, "", "#products");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#about-page" || cleanTarget === "#about-us") {
      setCurrentPage("about");
      window.history.pushState(null, "", "#about-page");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#manufacturing" || cleanTarget === "#cable-assemblies") {
      setCurrentPage("manufacturing");
      window.history.pushState(null, "", "#manufacturing");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#amphenol") {
      setCurrentPage("amphenol");
      window.history.pushState(null, "", "#amphenol");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#contact-page" || cleanTarget === "#contact-us") {
      setCurrentPage("contact");
      window.history.pushState(null, "", "#contact-page");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Navigating back to Home page sections
    if (currentPage !== "home") {
      setCurrentPage("home");
      window.history.pushState(null, "", target);
      setTimeout(() => {
        const id = target.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
      return;
    }

    const id = target.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Render individual page components
  if (currentPage === "products") {
    return <ShopPage onNavigateHome={handleNavigate} />;
  }

  if (currentPage === "about") {
    return <AboutPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "manufacturing") {
    return <ManufacturingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "amphenol") {
    return <AmphenolPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "contact") {
    return <ContactPage onNavigate={handleNavigate} />;
  }

  // Home Page
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={handleNavigate} currentPage="home" />
      <main>
        <Hero />
        <Stats />
        <BusinessStructure />
        <About />
        <Industries />
        <Why />
        <FacilitiesPreview />
        <ProductsOverview onNavigateToProducts={() => handleNavigate("#products", true)} />
        <FinalCTA />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
