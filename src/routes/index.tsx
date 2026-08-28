import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import logo from "@/assets/qualitech-logo.png.asset.json";
import heroHarness from "@/assets/hero-harness.jpg";
import aboutFactory from "@/assets/about-factory.jpg";
import cardCable from "@/assets/card-cable-assemblies.jpg";
import cardConnectors from "@/assets/card-connectors.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";
import indPower from "@/assets/ind-power.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indRailways from "@/assets/ind-railways.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

import { Counter, Reveal } from "@/components/site/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Qualitech Connectronics — Precision Wire & Cable Harnesses" },
      {
        name: "description",
        content:
          "Since 1995, Qualitech Connectronics builds custom wire and cable harnesses, cable assemblies and connector solutions for OEMs in telecom, power, defense and railways.",
      },
      { property: "og:title", content: "Qualitech Connectronics — Precision Connections" },
      {
        property: "og:description",
        content:
          "Custom-built wire and cable harnesses, cable assemblies and connector solutions for OEM applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const NAV = [
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Industries", href: "#industries" },
  { label: "Facilities", href: "#facilities" },
  { label: "Contact", href: "#contact" },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:py-5">
        <a href="#top" className="flex min-w-0 items-center">
          <img
            src={logo.url}
            alt="Qualitech Connectronics Private Limited"
            className="h-8 w-auto shrink-0 sm:h-10"
            width={320}
            height={80}
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 border border-graphite px-5 py-2.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-graphite transition-colors duration-300 hover:bg-graphite hover:text-background"
          >
            Request a Quote
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 border border-border lg:hidden"
        >
          <span
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-border bg-background transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 sm:px-8">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-border/70 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function CircuitLines() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 500"
      fill="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <g stroke="var(--brand-blue)" strokeWidth="1" opacity="0.5">
        <path
          d="M0 90 H120 L160 50 H400"
          strokeDasharray="140 420"
          style={{ animation: "trace 7s linear infinite" }}
        />
        <path
          d="M400 300 H300 L260 340 H0"
          strokeDasharray="140 420"
          style={{ animation: "trace 9s linear infinite 1.2s" }}
        />
        <path
          d="M40 500 V420 L90 370 V180"
          strokeDasharray="120 420"
          style={{ animation: "trace 8s linear infinite 2.4s" }}
        />
      </g>
      <g fill="var(--brand-orange)">
        <circle cx="160" cy="50" r="3" style={{ animation: "pulse-node 4s ease-in-out infinite" }} />
        <circle cx="260" cy="340" r="3" style={{ animation: "pulse-node 4s ease-in-out infinite 1.5s" }} />
        <circle cx="90" cy="180" r="3" style={{ animation: "pulse-node 4s ease-in-out infinite 2.8s" }} />
      </g>
    </svg>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 lg:pt-36">
      <div className="hairline-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="surface-steel absolute inset-y-0 right-0 hidden w-1/2 lg:block" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-20 lg:pb-28">
        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-orange" />
              <span className="label-eyebrow">Established 1995</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.06] text-graphite sm:text-5xl lg:text-6xl">
              Precision Connections.
              <span className="block text-steel">Engineered for Performance.</span>
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-6 max-w-xl font-display text-base font-semibold text-foreground sm:text-lg">
              Custom Wire &amp; Cable Harness Solutions for Demanding Industries
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
              Qualitech Connectronics delivers high-quality custom-built wire and cable harnesses,
              cable assemblies and connector solutions for OEM applications.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#what-we-do"
                className="group inline-flex items-center justify-center gap-3 bg-graphite px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-background transition-all duration-300 hover:bg-graphite-deep"
              >
                Explore Our Solutions
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-3 border border-graphite/25 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite transition-all duration-300 hover:border-graphite"
              >
                Request a Quote
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="relative">
            <div className="absolute -left-5 -top-5 h-20 w-20 border-l border-t border-brand-blue/40" aria-hidden="true" />
            <div className="absolute -bottom-5 -right-5 h-20 w-20 border-b border-r border-brand-blue/40" aria-hidden="true" />
            <div className="relative overflow-hidden bg-steel-light shadow-[var(--shadow-panel)]">
              <img
                src={heroHarness}
                alt="Custom wire harness with precision multi-pin connectors"
                width={1200}
                height={1408}
                className="h-[420px] w-full object-cover sm:h-[520px] lg:h-[600px]"
              />
              <CircuitLines />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STATS = [
  { value: 1995, label: "Established", plain: true },
  { value: 30, suffix: "+", label: "Years of Experience" },
  { text: "OEM", label: "Focused Solutions" },
  { value: 4, label: "Key Industries" },
];

function Stats() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border px-0 sm:px-8 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 90}
            className="bg-background px-6 py-10 text-center lg:py-14"
          >
            <div className="font-display text-3xl font-extrabold tabular-nums text-graphite sm:text-4xl lg:text-5xl">
              {stat.text ? (
                stat.text
              ) : stat.plain ? (
                <Counter value={stat.value as number} duration={1} />
              ) : (
                <Counter value={stat.value as number} suffix={stat.suffix} />
              )}
            </div>
            <div className="mx-auto mt-4 h-px w-8 bg-brand-blue" />
            <p className="mt-4 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-orange" />
              <span className="label-eyebrow">About Qualitech</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-7 font-display text-3xl font-extrabold leading-tight text-graphite sm:text-4xl lg:text-[2.75rem]">
              Built on Experience.
              <span className="block text-steel">Driven by Precision.</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-7 space-y-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              <p>
                Established in 1995, Qualitech Connectronics Private Limited manufactures
                custom-built wire and cable harnesses, cable assemblies and connector solutions for
                original equipment manufacturers.
              </p>
              <p>
                Our experienced manpower, process discipline and manufacturing technology allow us
                to build assemblies to each customer's drawings and application requirements —
                from single cable assemblies to complex multi-branch harnesses.
              </p>
              <p>
                Every harness is engineered around the environment it operates in, so OEM teams
                receive a connection solution that fits the product, not a catalogue compromise.
              </p>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <a
              href="#what-we-do"
              className="group mt-9 inline-flex items-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite"
            >
              What we do
              <span className="h-px w-8 bg-graphite transition-all duration-300 group-hover:w-14" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="relative">
            <div className="overflow-hidden bg-steel-light">
              <img
                src={aboutFactory}
                alt="Wire harness assembly team working on the Qualitech production floor"
                loading="lazy"
                width={1408}
                height={1008}
                className="h-[380px] w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-precise)] hover:scale-[1.04] sm:h-[520px] lg:h-[640px]"
              />
            </div>
            <div className="absolute -bottom-6 left-6 hidden bg-background px-8 py-6 shadow-[var(--shadow-panel)] sm:block">
              <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Manufacturing since
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-graphite">1995</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const WHAT_WE_DO = [
  {
    title: "Cable Assemblies",
    image: cardCable,
    copy: "Custom-built assemblies produced to customer drawings, with controlled cutting, crimping, moulding and continuity checks.",
  },
  {
    title: "Connectors",
    image: cardConnectors,
    copy: "A broad range of circular, rectangular and coaxial connector solutions selected for the application and its environment.",
  },
  {
    title: "Facilities",
    image: cardFacilities,
    copy: "Dedicated harness manufacturing space, assembly boards and test benches supported by an experienced production team.",
  },
];

function WhatWeDo() {
  return (
    <section id="what-we-do" className="surface-steel border-y border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">What We Do</span>
          </div>
          <h2 className="mt-7 max-w-2xl font-display text-3xl font-extrabold leading-tight text-graphite sm:text-4xl">
            Complete connection solutions, built to your specification.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {WHAT_WE_DO.map((item, i) => (
            <Reveal key={item.title} delay={i * 110}>
              <article className="group relative h-full border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                <span className="absolute inset-x-0 top-0 z-10 h-0.5 w-0 bg-brand-blue transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="h-56 w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col p-7">
                  <h3 className="font-display text-xl font-bold text-graphite">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  <span className="mt-7 inline-flex items-center gap-3 font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-graphite">
                    Learn more
                    <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const INDUSTRIES = [
  { name: "Telecommunications", image: indTelecom },
  { name: "Power", image: indPower },
  { name: "Defense", image: indDefense },
  { name: "Railways", image: indRailways },
];

function Industries() {
  return (
    <section id="industries" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-brand-orange" />
          <span className="label-eyebrow">Industries</span>
        </div>
        <h2 className="mt-7 max-w-2xl font-display text-3xl font-extrabold leading-tight text-graphite sm:text-4xl">
          Solutions for Critical Industries
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {INDUSTRIES.map((item, i) => (
          <Reveal key={item.name} delay={i * 100}>
            <div className="group relative overflow-hidden bg-graphite">
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
                <span className="block h-px w-8 bg-brand-orange transition-all duration-500 group-hover:w-16" />
                <h3 className="mt-4 font-display text-lg font-bold text-background">{item.name}</h3>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  { n: "01", title: "Application-Specific", copy: "Every harness engineered around its end use, environment and assembly constraints." },
  { n: "02", title: "Quality Focused", copy: "Controlled processes and inspection at each stage of build and termination." },
  { n: "03", title: "Experienced Team", copy: "Skilled manpower with decades of combined harness manufacturing experience." },
  { n: "04", title: "Competitive Solutions", copy: "Practical design and material choices that keep OEM programs cost-effective." },
  { n: "05", title: "Timely Supply", copy: "Planned production and dispatch aligned to customer schedules." },
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
          <h2 className="mt-7 max-w-2xl font-display text-3xl font-extrabold leading-tight text-graphite sm:text-4xl">
            Five reasons OEMs keep coming back.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {WHY.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="group bg-background p-7">
              <span className="font-display text-[0.7rem] font-bold tracking-[0.2em] text-brand-blue">
                {item.n}
              </span>
              <h3 className="mt-5 font-display text-base font-bold text-graphite">{item.title}</h3>
              <span className="mt-4 block h-px w-6 bg-border transition-all duration-500 group-hover:w-12 group-hover:bg-brand-blue" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

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
          <h2 className="mt-7 font-display text-3xl font-extrabold leading-tight text-background sm:text-4xl lg:text-5xl">
            Technology Meets Expertise
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-steel">
            Purpose-built harness manufacturing supported by assembly boards, termination equipment
            and an experienced production team.
          </p>
          <a
            href="#contact"
            className="group mt-10 inline-flex items-center gap-3 border border-background/35 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:border-background"
          >
            Explore Our Facilities
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

const PRODUCTS = [
  { image: p1, name: "Circular Connectors" },
  { image: p2, name: "Rectangular Housings" },
  { image: p3, name: "Coaxial Connectors" },
  { image: p4, name: "Shielded Cables" },
  { image: p5, name: "Glands & Backshells" },
  { image: p6, name: "Terminals & Blocks" },
];

function ProductMarquee() {
  const loop = [...PRODUCTS, ...PRODUCTS];
  return (
    <section className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">Authorized &amp; Supported Products</span>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="marquee-track flex w-max gap-5">
          {loop.map((item, i) => (
            <figure
              key={`${item.name}-${i}`}
              className="group w-[240px] shrink-0 border border-border bg-steel-light transition-colors duration-300 hover:border-brand-blue/50 sm:w-[300px]"
            >
              <div className="overflow-hidden bg-background">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={700}
                  height={560}
                  className="h-40 w-full object-cover transition-transform duration-700 ease-[var(--ease-precise)] group-hover:scale-105 sm:h-48"
                />
              </div>
              <figcaption className="px-5 py-4 font-display text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {item.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="contact" className="surface-graphite relative overflow-hidden">
      <div className="hairline-grid absolute inset-0 opacity-[0.12]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-32">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow text-steel">Get in touch</span>
          </div>
          <h2 className="mt-7 max-w-xl font-display text-3xl font-extrabold leading-tight text-background sm:text-4xl lg:text-5xl">
            Looking for a Custom Cable Solution?
          </h2>
          <p className="mt-5 text-[0.95rem] text-steel">
            Tell us about your application and requirements.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:info@qualitechindia.in"
              className="group inline-flex items-center justify-center gap-3 bg-background px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite transition-transform duration-300 hover:-translate-y-0.5"
            >
              Request a Quote
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="tel:+914027140004"
              className="group inline-flex items-center justify-center gap-3 border border-background/35 px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:border-background"
            >
              Contact Us
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="border-t border-background/15 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="label-eyebrow text-steel">Direct line</p>
            <a
              href="tel:+914027140004"
              className="mt-3 block font-display text-2xl font-bold text-background transition-colors duration-300 hover:text-brand-blue-soft sm:text-3xl"
            >
              +91-40-27140004
            </a>
            <p className="label-eyebrow mt-8 text-steel">Email</p>
            <a
              href="mailto:info@qualitechindia.in"
              className="mt-3 block font-display text-xl font-bold text-background transition-colors duration-300 hover:text-brand-blue-soft sm:text-2xl"
            >
              info@qualitechindia.in
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-graphite-deep">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src={logo.url}
              alt="Qualitech Connectronics Private Limited"
              loading="lazy"
              width={320}
              height={80}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-steel">
              Custom wire and cable harnesses, cable assemblies and connector solutions for OEM
              applications since 1995.
            </p>
          </div>

          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-steel transition-colors duration-300 hover:text-background"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Products
            </h3>
            <ul className="mt-5 space-y-3">
              {PRODUCTS.map((item) => (
                <li key={item.name} className="text-sm text-steel">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Contact
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-steel">
              <li>
                <a
                  href="tel:+914027140004"
                  className="transition-colors duration-300 hover:text-background"
                >
                  +91-40-27140004
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@qualitechindia.in"
                  className="transition-colors duration-300 hover:text-background"
                >
                  info@qualitechindia.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-background/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-steel">
            © {new Date().getFullYear()} Qualitech Connectronics Private Limited. All rights reserved.
          </p>
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-steel">
            Precision Connections
          </p>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Stats />
        <About />
        <WhatWeDo />
        <Industries />
        <Why />
        <FacilitiesPreview />
        <ProductMarquee />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
