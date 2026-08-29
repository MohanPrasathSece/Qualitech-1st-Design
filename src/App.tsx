import { useEffect, useState } from "react";

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
import { Footer } from "@/components/site/Footer";
import { ShopPage } from "@/pages/ShopPage";

export default Home;

/* ─── Navigation ─── */

export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
}

const NAV: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about" },
  { label: "Facilities", href: "#facilities" },
  { label: "Shop", href: "#products", isPage: true },
  { label: "Contact Us", href: "#contact" },
];

interface HeaderProps {
  onNavigate: (href: string, isPage?: boolean) => void;
  currentPage?: string;
}

function Header({ onNavigate, currentPage = "home" }: HeaderProps) {
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
        <button
          onClick={() => onNavigate("#top")}
          className="flex min-w-0 items-center cursor-pointer text-left"
        >
          <img
            src="/logo.png"
            alt="Qualitech Connectronics Private Limited"
            className="h-8 w-auto shrink-0 sm:h-10"
            width={320}
            height={80}
          />
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.href, item.isPage)}
              className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer ${
                item.isPage && currentPage === "products"
                  ? "text-brand-blue font-bold border-b-2 border-brand-blue pb-0.5"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate("#contact")}
            className="group inline-flex items-center gap-2 rounded-xl border border-graphite px-5 py-2.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-graphite transition-colors duration-300 hover:bg-graphite hover:text-background cursor-pointer"
          >
            Request a Quote
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border lg:hidden cursor-pointer"
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
        className={`overflow-hidden rounded-b-2xl border-t border-border bg-background transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 sm:px-8">
          {NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                onNavigate(item.href, item.isPage);
              }}
              className="border-b border-border/70 py-3.5 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

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
  { value: 4, label: "Key Industries" },
  { value: 1995, label: "Year Founded", plain: true },
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

/* ─── Authorized & Supported Products (Flowing Logo Carousel) ─── */

const BRAND_LOGOS = [
  {
    id: "belden",
    name: "Belden",
    content: (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center tracking-tighter">
          <span className="font-extrabold text-2xl text-[#00519e] tracking-tight">BEL</span>
          <svg className="h-6 w-5 mx-0.5 text-[#00519e]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 3h7a8 8 0 0 1 8 8 8 8 0 0 1-8 8H4V3zm4 3v10h3a5 5 0 0 0 5-5 5 5 0 0 0-5-5H8z"/>
            <path d="M10 6a4 4 0 0 1 4 4 4 4 0 0 1-4 4V6z" fill="#0072ce" opacity="0.6"/>
          </svg>
          <span className="font-extrabold text-2xl text-[#00519e] tracking-tight">EN</span>
        </div>
        <span className="text-[0.52rem] font-bold tracking-wider text-[#00873d] uppercase mt-0.5">
          Sending All The Right Signals
        </span>
      </div>
    ),
  },
  {
    id: "bulgin",
    name: "Bulgin",
    content: (
      <div className="flex items-center gap-2.5">
        <svg className="h-8 w-8 shrink-0" viewBox="0 0 32 32" fill="none">
          <polygon points="12,2 20,6 12,11 4,7" fill="#6d397d" />
          <polygon points="4,7 12,11 12,20 4,16" fill="#4d2458" />
          <polygon points="12,11 20,6 20,15 12,20" fill="#582d64" />
          <polygon points="18,12 26,16 18,21 10,17" fill="#009fe3" />
          <polygon points="10,17 18,21 18,28 10,24" fill="#007bb3" />
          <polygon points="18,21 26,16 26,23 18,28" fill="#008ecc" />
          <polygon points="8,23 12,25 8,27 4,25" fill="#a4a9ad" />
          <polygon points="4,25 8,27 8,30 4,28" fill="#888c90" />
          <polygon points="8,27 12,25 12,28 8,30" fill="#999ea2" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-bold text-xl text-[#4a4f54] leading-tight font-sans lowercase tracking-tight">
            bulgin
          </span>
          <span className="text-[0.52rem] text-muted-foreground leading-none">
            a brand of Elektron Technology
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "lemo",
    name: "LEMO",
    content: (
      <div className="flex items-center gap-2">
        <svg className="h-7 w-7 text-[#0066b2]" viewBox="0 0 36 36" fill="currentColor">
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M12 11h4v10h8v4H12V11z"/>
          <polygon points="8,18 12,14 12,22"/>
        </svg>
        <div className="flex items-center">
          <span className="font-extrabold italic text-2xl tracking-wider text-[#0066b2]">
            LEMO
          </span>
          <span className="text-[0.6rem] font-bold text-[#0066b2] self-start ml-0.5">®</span>
        </div>
      </div>
    ),
  },
  {
    id: "chogori",
    name: "Chogori",
    content: (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center">
          <span className="font-black text-2xl text-[#d82423] tracking-wider uppercase">
            CHOGORI
          </span>
          <span className="text-[0.6rem] font-bold text-[#d82423] self-start ml-0.5">®</span>
        </div>
        <span className="text-[0.52rem] text-[#333333] font-medium mt-0.5">
          Shenzhen Chogori Technology Co.,Ltd
        </span>
      </div>
    ),
  },
  {
    id: "harting",
    name: "HARTING",
    content: (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 bg-[#fed100] rounded-sm flex items-center justify-center border border-[#e5bc00] shadow-2xs">
          <span className="font-black text-lg text-black font-sans leading-none">H</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-black text-xl text-graphite tracking-wide uppercase leading-tight font-sans">
            HARTING
          </span>
          <span className="text-[0.5rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Pushing Performance
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "amphenol",
    name: "Amphenol",
    content: (
      <div className="flex items-center gap-2">
        <svg className="h-7 w-7 text-[#004f9e]" viewBox="0 0 32 32" fill="currentColor">
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 16c2-6 6-6 8 0s6 6 8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span className="font-extrabold text-xl text-[#004f9e] tracking-tight">
          Amphenol
        </span>
      </div>
    ),
  },
  {
    id: "phoenix",
    name: "Phoenix Contact",
    content: (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 bg-[#00805e] rounded-sm flex items-center justify-center">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,4 14,12 6,20 10,20 18,12 10,4"/>
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-black text-sm text-graphite uppercase tracking-tight leading-none">
            PHOENIX
          </span>
          <span className="font-bold text-xs text-[#00805e] uppercase tracking-wider leading-none mt-0.5">
            CONTACT
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "te",
    name: "TE Connectivity",
    content: (
      <div className="flex items-center gap-2">
        <div className="bg-[#e86c00] text-white font-black text-sm px-2 py-1 rounded-sm leading-none">
          TE
        </div>
        <span className="font-bold text-base text-graphite tracking-tight lowercase">
          connectivity
        </span>
      </div>
    ),
  },
];

function AuthorizedProducts() {
  const loop = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <section className="border-b border-border/70 bg-[#f8fafd] py-14 lg:py-18 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-graphite sm:text-3xl">
            Authorized and Supported Products
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Trusted global interconnect manufacturers and certified components
          </p>
        </Reveal>
      </div>

      <div className="relative mt-10 overflow-hidden">
        {/* Soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f8fafd] to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f8fafd] to-transparent sm:w-36" />

        {/* Marquee track flowing right to left */}
        <div className="marquee-track flex w-max gap-6 items-center">
          {loop.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="w-[260px] h-[105px] shrink-0 rounded-xl border border-border/80 bg-white px-6 py-4 flex items-center justify-center shadow-xs transition-all duration-300 hover:border-brand-blue/50 hover:shadow-md"
            >
              {brand.content}
            </div>
          ))}
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
                successfully managed the company for nearly two decades, Qualitech is now a leading
                provider of high quality custom built Wire and cable harnesses to OEMs.
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
              href="#what-we-do"
              className="group mt-9 inline-flex items-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite"
            >
              Discover Our Story
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

/* ─── What We Do ─── */

const WHAT_WE_DO = [
  {
    num: "01",
    title: "Cable Assemblies",
    image: cardCable,
    copy: "Custom-built wire and cable harness solutions designed and manufactured to your exact OEM specifications, 100% electrically tested.",
  },
  {
    num: "02",
    title: "Connectors",
    image: cardConnectors,
    copy: "A comprehensive range of DSUB, DIN, IDC, HARTING and speciality connectors for industrial, telecom, power and defence applications.",
  },
  {
    num: "03",
    title: "Facilities",
    image: cardFacilities,
    copy: "Modern manufacturing facilities combining latest technology with experienced manpower to deliver precision and reliability.",
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
          <h2 className="mt-7 max-w-2xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
            Engineered Connectivity Solutions
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            From standard connectors to fully custom cable harness assemblies, we engineer solutions built around your exact requirements.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {WHAT_WE_DO.map((item, i) => (
            <Reveal key={item.title} delay={i * 110}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                <span className="absolute inset-x-0 top-0 z-10 h-0.5 w-0 rounded-t-2xl bg-brand-blue transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />
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
                  <span className="font-display text-[0.7rem] font-bold tracking-[0.2em] text-brand-blue">
                    {item.num}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-graphite">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  <span className="mt-7 inline-flex items-center gap-3 font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-graphite">
                    Learn More
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

      <Reveal delay={450}>
        <div className="mt-10 text-center">
          <a
            href="#industries"
            className="group inline-flex items-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-graphite transition-colors duration-300 hover:text-brand-blue"
          >
            Explore All Industries
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
      </Reveal>
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

/* ─── Product Catalogue ─── */

const PRODUCT_MARQUEE = [
  { image: p1, name: "Circular Connectors" },
  { image: p2, name: "Rectangular Housings" },
  { image: p3, name: "Coaxial Connectors" },
  { image: p4, name: "Shielded Cables" },
  { image: p5, name: "Glands & Backshells" },
  { image: p6, name: "Terminals & Blocks" },
];

interface ProductCatalogueProps {
  onNavigateToShop?: () => void;
}

function ProductCatalogue({ onNavigateToShop }: ProductCatalogueProps) {
  const loop = [...PRODUCT_MARQUEE, ...PRODUCT_MARQUEE];
  return (
    <section id="shop" className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-yellow" />
                <span className="label-eyebrow">Product Catalogue</span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                Authorized &amp; Supported Products
              </h2>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
                High-reliability connectors, backshells, shielded cables, and custom interconnect components for demanding OEM applications.
              </p>
            </div>
            <button
              onClick={onNavigateToShop}
              className="self-start sm:self-auto rounded-xl bg-graphite px-6 py-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              Browse Full Shop &amp; Catalog →
            </button>
          </div>
        </Reveal>
      </div>

      {/* Marquee */}
      <div className="relative mt-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="marquee-track flex w-max gap-5">
          {loop.map((item, i) => (
            <figure
              key={`${item.name}-${i}`}
              className="group w-[240px] shrink-0 overflow-hidden rounded-xl border border-border bg-steel-light transition-colors duration-300 hover:border-brand-blue/50 sm:w-[300px]"
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
            Looking for a Custom Cable Solution?
          </h2>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
            Tell us about your application and requirements. Our engineering team will work with you
            to develop the right connectivity solution.
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
            <p className="label-eyebrow mt-6">Email</p>
            <a
              href="mailto:info@qualitechindia.in"
              className="mt-2 block font-display text-xl font-bold text-brand-blue transition-colors duration-300 hover:text-graphite sm:text-2xl"
            >
              info@qualitechindia.in
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}



/* ─── Home (root component) ─── */

function Home() {
  const [currentPage, setCurrentPage] = useState<"home" | "products">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === "#products" || hash === "#shop" || path === "/products" || path === "/shop") {
        return "products";
      }
    }
    return "home";
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === "#products" || hash === "#shop" || path === "/products" || path === "/shop") {
        setCurrentPage("products");
      } else {
        setCurrentPage("home");
      }
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const handleNavigate = (target: string, isPage?: boolean) => {
    if (isPage || target === "#products" || target === "#shop") {
      setCurrentPage("products");
      window.history.pushState(null, "", "#products");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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

  if (currentPage === "products") {
    return <ShopPage onNavigateHome={(target) => handleNavigate(target || "#top")} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main>
        <Hero />
        <Stats />
        <AuthorizedProducts />
        <About />
        <WhatWeDo />
        <Industries />
        <Why />
        <FacilitiesPreview />
        <ProductCatalogue onNavigateToShop={() => handleNavigate("#products", true)} />
        <FinalCTA />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
