import { useEffect, useState, useRef } from "react";

import heroHarness from "@/assets/custom-cable-harness-assembly-qualitech-india.jpg";
import aboutFactory from "@/assets/qualitech-cable-assembly-manufacturing-facility-hyderabad.jpg";
import cardCable from "@/assets/custom-cable-assemblies-wire-harnesses-qualitech-india.jpg";
import cardConnectors from "@/assets/electronic-connectors-amphenol-zolex-qualitech-india.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";
import indPower from "@/assets/ind-power.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indRailways from "@/assets/ind-railways.jpg";
import indEV from "@/assets/ind-ev.jpg";
import indWhiteGoods from "@/assets/ind-white-goods.jpg";
import indConsumerElectronics from "@/assets/ind-consumer-electronics.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";

import { Counter, Reveal } from "@/components/site/reveal";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ShopPage } from "@/pages/ShopPage";
import { AboutPage } from "@/pages/AboutPage";
import { ManufacturingPage } from "@/pages/ManufacturingPage";
import { AmphenolPage } from "@/pages/AmphenolPage";
import { ZolexPage } from "@/pages/ZolexPage";
import { QualitechPage } from "@/pages/QualitechPage";
import { ContactPage } from "@/pages/ContactPage";
import { AdminPage } from "@/pages/AdminPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsPage } from "@/pages/TermsPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { AbandonedCheckoutsPage } from "@/pages/AbandonedCheckoutsPage";
import { ECommerceProvider } from "@/context/ECommerceContext";
import { CartDrawer } from "@/components/ecommerce/CartDrawer";
import { ProductDetailModal } from "@/components/ecommerce/ProductDetailModal";
import { OrderSuccessModal } from "@/components/ecommerce/OrderSuccessModal";
import { WhatsAppWidget } from "@/components/common/WhatsAppWidget";
import { FloatingCartWidget } from "@/components/ecommerce/FloatingCartWidget";

export default function App() {
  return (
    <ECommerceProvider>
      <HomeContent />
      <CartDrawer onNavigateToShop={() => {
        window.location.hash = "#products";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }} />
      <ProductDetailModal />
      <OrderSuccessModal />
      <FloatingCartWidget />
      <WhatsAppWidget />
    </ECommerceProvider>
  );
}

/* ─── Hero ─── */

function Hero({ onNavigate }: { onNavigate?: (target: string, isPage?: boolean) => void }) {
  return (
    <section id="top" className="relative overflow-hidden bg-background pt-32 sm:pt-36 lg:pt-40">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="label-eyebrow">QUALITECH CONNECTRONICS PRIVATE LIMITED | ESTABLISHED 1995</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.14] text-graphite">
              Electronic Connectors Distributor &amp;
              <span className="block text-brand-blue mt-1 sm:mt-1.5">Cable Assembly Manufacturer in India</span>
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-5 max-w-xl font-display text-base font-semibold text-graphite sm:text-lg">
              Precision Connections. Engineered for Performance.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-3.5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
              Qualitech Connectronics supplies electronic connectors and components from trusted brands such as Amphenol and Zolex, alongside custom-engineered cable assemblies and wire harnesses for OEM and industrial applications. We deliver application-specific connectivity solutions backed by manufacturing expertise and a commitment to quality.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("#products", true);
                }}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-graphite px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm"
              >
                Explore Products
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
              <a
                href="#contact-page"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("#contact-page");
                }}
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
              alt="Custom cable harness assembly manufactured by Qualitech Connectronics in India"
              title="Custom Cable Harness Assembly – Qualitech India"
              loading="eager"
              decoding="async"
              fetchPriority="high"
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
  { value: 1995, label: "Established 1995", plain: true },
  { value: 30, suffix: "+", label: "Years of Industry Experience" },
  { text: "OEM", label: "OEM-Focused Solutions" },
  { text: "ISO", label: "ISO 9001 Quality System" },
  { value: 7, suffix: "+", label: "Serving 7+ Key Industries" },
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

/* ─── Business Structure ─── */

const DISTRIBUTOR_LOGOS = [
  { name: "Amphenol", file: "AmphenolLogo-9Bd.png" },
  { name: "Zolex", file: "zolex.png" },
  { name: "Boyu", file: "boyu.png" },
  { name: "Edge Connect", file: "edge conn.png" },
  { name: "HADZ", file: "hadz.png" },
  { name: "HXH", file: "hxh.png" },
  { name: "Inlinko", file: "inlinko.png" },
  { name: "Ixnya", file: "ixnya.png" },
  { name: "Omten", file: "omten.png" },
  { name: "SFA", file: "sfa.png" },
  { name: "Sunchu", file: "sunchu.png" },
  { name: "WCH", file: "wch.png" },
  { name: "XHF", file: "xhf.png" },
];

interface BusinessStructureProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

function BusinessStructure({ onNavigate }: BusinessStructureProps) {
  return (
    <section id="business" className="surface-steel border-b border-border overflow-hidden w-full">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:py-32 w-full min-w-0">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">What We Do</span>
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-2xl font-bold leading-tight text-graphite sm:mt-7 sm:text-4xl lg:text-[2.75rem]">
            Electronic Components Distribution &amp; Custom Cable Assembly Solutions
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Qualitech Connectronics provides electronic connectivity solutions through the distribution of trusted electronic components and the manufacturing of custom cable assemblies and wire harnesses. We support OEMs and industrial businesses with product sourcing, application-specific solutions and reliable manufacturing capabilities.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-14 sm:gap-8 lg:grid-cols-2 w-full min-w-0">
          {/* Card 01: Distribution */}
          <Reveal delay={100} className="h-full flex flex-col w-full min-w-0 max-w-full">
            <article className="group relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)] flex flex-col justify-between">
              <span className="absolute inset-x-0 top-0 z-10 h-1 w-0 rounded-t-2xl bg-brand-blue transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />

              <div className="w-full min-w-0">
                <div className="overflow-hidden w-full">
                  <img
                    src={cardConnectors}
                    alt="Electronic connectors distributed by Qualitech Connectronics, including Amphenol and Zolex connector solutions"
                    title="Electronic Connectors – Qualitech India"
                    loading="lazy"
                    decoding="async"
                    width={900}
                    height={500}
                    className="h-44 w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110 sm:h-52"
                  />
                </div>

                <div className="p-5 sm:p-8 w-full min-w-0">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 font-display text-base font-bold text-brand-blue sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg">
                      01
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold leading-snug text-graphite sm:text-xl sm:text-2xl">
                        Electronic Connectors &amp; Components Distribution
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-[0.92rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-[0.95rem]">
                    We supply electronic connectors and components from established brands for industrial, automotive, telecom, defence and OEM applications. Our product range supports diverse connectivity requirements across multiple industries.
                  </p>

                  <ul className="mt-4 space-y-2 sm:mt-5">
                    {[
                      "Amphenol and Zolex product distribution",
                      "Genuine components from trusted brands",
                      "Wide range of electronic connectors",
                      "Product sourcing and technical support",
                      "Solutions for OEM and industrial applications",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                        <span className="h-1 w-1 rounded-full bg-brand-blue shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Partner Brand Scrolling Logos */}
                  <div className="mt-5 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-steel-light/20 py-3 sm:mt-6 sm:rounded-xl sm:py-4">
                    <div className="flex marquee-track w-max">
                      {[...Array(2)].map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-6 px-3 shrink-0 sm:gap-8 sm:px-4">
                          {DISTRIBUTOR_LOGOS.map((logo) => (
                            <div
                              key={logo.file}
                              className="shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-105"
                            >
                              <img
                                src={`/images/distributor%20logos/${encodeURIComponent(logo.file)}`}
                                alt={logo.name}
                                title={logo.name}
                                className="h-6 w-auto max-w-[85px] object-contain drop-shadow-xs sm:h-8 sm:max-w-[110px]"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-8 sm:pb-8 pt-0 w-full flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("#products", true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/30 px-3.5 py-2 font-display text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue hover:bg-brand-blue hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  Explore Electronic Connectors →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("#amphenol", true)}
                  className="group/btn inline-flex items-center gap-2.5 font-display text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-blue cursor-pointer sm:text-[0.72rem] sm:tracking-[0.2em]"
                >
                  Authorised Lines
                  <span className="h-px w-6 bg-brand-blue transition-all duration-300 group-hover/btn:w-14 sm:w-8" />
                </button>
              </div>
            </article>
          </Reveal>

          {/* Card 02: Manufacturing */}
          <Reveal delay={200} className="h-full flex flex-col w-full min-w-0 max-w-full">
            <article className="group relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background transition-all duration-500 ease-[var(--ease-precise)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)] flex flex-col justify-between">
              <span className="absolute inset-x-0 top-0 z-10 h-1 w-0 rounded-t-2xl bg-brand-yellow transition-all duration-500 ease-[var(--ease-precise)] group-hover:w-full" />

              <div className="w-full min-w-0">
                <div className="overflow-hidden w-full">
                  <img
                    src={cardCable}
                    alt="Custom cable assemblies and wire harnesses manufactured by Qualitech Connectronics for OEM applications"
                    title="Custom Cable Assemblies & Wire Harnesses – Qualitech India"
                    loading="lazy"
                    decoding="async"
                    width={900}
                    height={500}
                    className="h-44 w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110 sm:h-52"
                  />
                </div>

                <div className="p-5 sm:p-8 w-full min-w-0">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-yellow/20 font-display text-base font-bold text-graphite sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg">
                      02
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold leading-snug text-graphite sm:text-xl sm:text-2xl">
                        Custom Cable Assembly &amp; Wire Harness Manufacturing
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-[0.92rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-[0.95rem]">
                    We design and manufacture custom wire harnesses and cable assemblies based on specific OEM requirements. Our solutions are developed to meet application needs, with in-house assembly capabilities and electrical testing.
                  </p>

                  <ul className="mt-4 space-y-2 sm:mt-5">
                    {[
                      "Custom Cable Assemblies",
                      "Wire Harness Manufacturing",
                      "Application-Specific Assemblies",
                      "OEM Cable Solutions",
                      "In-House Production & Assembly",
                      "Electrical Testing",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                        <span className="h-1 w-1 rounded-full bg-brand-yellow shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 p-3 rounded-lg bg-steel-light/30 border border-border sm:mt-6 sm:p-3.5 sm:rounded-xl w-full">
                    <p className="text-xs font-semibold text-graphite">
                       In-House Production &amp; Custom Assembly Floor
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                      ISO 9001 certified assembly floor in Hyderabad
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-8 sm:pb-8 pt-0 w-full">
                <button
                  type="button"
                  onClick={() => onNavigate("#manufacturing", true)}
                  className="group/btn inline-flex items-center gap-2.5 font-display text-[0.68rem] font-bold uppercase tracking-[0.14em] text-graphite cursor-pointer sm:text-[0.72rem] sm:tracking-[0.2em]"
                >
                  Explore Manufacturing Capabilities
                  <span className="h-px w-6 bg-graphite transition-all duration-300 group-hover/btn:w-14 sm:w-8" />
                </button>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */

function About({ onNavigate }: { onNavigate?: (target: string) => void }) {
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
              Over Three Decades of Experience in Electronic Connectivity Solutions
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-7 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              <p>
                Established in 1995, Qualitech Connectronics Private Limited has built its expertise in electronic components distribution and custom cable assembly manufacturing.
              </p>
              <p>
                We supply electronic connectors from trusted brands and manufacture high-quality custom-built wire and cable harnesses for OEM applications.
              </p>
              <p>
                Our experienced team, manufacturing capabilities and focus on precision help us deliver application-specific connectivity solutions while supporting customer requirements for quality, performance and timely supply.
              </p>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <a
              href="#business"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("#business");
              }}
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
                alt="Qualitech Connectronics manufacturing facility in Hyderabad, India, for custom cable assemblies and wire harness production"
                title="Qualitech Manufacturing Facility – Hyderabad, India"
                loading="lazy"
                decoding="async"
                width={1408}
                height={1008}
                className="h-[380px] w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-precise)] hover:scale-[1.04] sm:h-[520px] lg:h-[640px]"
              />
            </div>
            <div className="absolute -bottom-6 left-6 hidden rounded-xl bg-background px-8 py-6 shadow-[var(--shadow-panel)] sm:block">
              <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Manufacturing &amp; Distribution Expertise
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-graphite">Since 1995</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Industries ─── */

const INDUSTRIES = [
  {
    name: "Electric Vehicles (EV)",
    desc: "Custom wiring harnesses, battery interconnections and connectivity solutions for electric vehicle applications.",
    image: indEV,
  },
  {
    name: "White Goods",
    desc: "Custom wiring assemblies and motor or control harnesses for home appliances and white goods manufacturers.",
    image: indWhiteGoods,
  },
  {
    name: "Consumer Electronics",
    desc: "Electronic connectors and cable assembly solutions for consumer electronic devices and equipment.",
    image: indConsumerElectronics,
  },
  {
    name: "Telecommunications",
    desc: "Connectivity components and cable solutions for telecom infrastructure and networking applications.",
    image: indTelecom,
  },
  {
    name: "Power & Energy",
    desc: "Electrical connectivity and wiring solutions for power generation and distribution applications.",
    image: indPower,
  },
  {
    name: "Defence",
    desc: "Electronic components and application-specific cable assemblies for defence-related requirements.",
    image: indDefense,
  },
  {
    name: "Railways",
    desc: "Robust electrical connectivity and wiring solutions for railway signalling and rolling stock applications.",
    image: indRailways,
  },
  {
    name: "Industrial Automation",
    desc: "Connectors, components and custom cable assemblies for industrial machinery and automation systems.",
    image: cardFacilities,
  },
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
          Electronic Connectivity Solutions for Critical Industries
        </h2>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Different industries demand different connectivity requirements. Qualitech supports diverse industrial and OEM applications with electronic components, custom cable assemblies and wire harness solutions designed around specific application needs.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {INDUSTRIES.map((item, i) => (
          <Reveal key={item.name} delay={i * 80}>
            <div className="group relative overflow-hidden rounded-2xl bg-graphite shadow-md hover:shadow-xl transition-all duration-500">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                width={800}
                height={1000}
                className="h-[340px] w-full object-cover opacity-85 transition-all duration-[1200ms] ease-[var(--ease-precise)] group-hover:scale-110 group-hover:opacity-100 sm:h-[360px] lg:h-[380px]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-graphite-deep/90 via-graphite-deep/30 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="block h-px w-8 bg-brand-yellow transition-all duration-500 group-hover:w-16" />
                <h3 className="mt-4 font-display text-lg font-bold text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-light/85">{item.desc}</p>
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
  { title: "Application-Specific Solutions", copy: "Custom cable assemblies and wire harnesses developed to meet individual application and specification requirements." },
  { title: "Quality-Focused Manufacturing", copy: "Electrical testing and quality checks support product reliability and consistency throughout the manufacturing process." },
  { title: "Experienced Team", copy: "Established in 1995, our experience in electronic components and cable assembly solutions helps us understand diverse customer requirements." },
  { title: "Competitive Solutions", copy: "Efficient manufacturing processes and resource optimisation help deliver practical solutions for OEM requirements." },
  { title: "Reliable Supply", copy: "A commitment to timely supply and customer coordination helps support production schedules and business requirements." },
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
            Your Reliable Partner for OEM Connectivity Requirements
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            From electronic component sourcing to custom cable assembly manufacturing, Qualitech combines industry experience, technical capabilities and a quality-focused approach to support demanding OEM requirements.
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

function FacilitiesPreview({ onNavigate }: { onNavigate?: (target: string, isPage?: boolean) => void }) {
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
            <span className="label-eyebrow text-steel">Facilities &amp; Infrastructure</span>
          </div>
          <h2 className="mt-7 font-display text-3xl font-bold leading-tight text-background sm:text-4xl lg:text-5xl">
            Cable Assembly Manufacturing &amp; Testing Capabilities
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-steel">
            Qualitech's manufacturing environment combines equipment, technical expertise and in-house assembly capabilities to produce custom wire harnesses and cable assemblies for OEM applications.
          </p>
          <a
            href="#manufacturing"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("#manufacturing", true);
            }}
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

/* ─── Products Overview ─── */

interface ProductsOverviewProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

function ProductsOverview({ onNavigate }: ProductsOverviewProps) {
  return (
    <section id="shop" className="border-y border-border bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-yellow" />
                <span className="label-eyebrow">Our Products &amp; Services</span>
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                Solutions You Can Trust
              </h2>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
                From globally trusted electronics component brands to custom-engineered cable assemblies - explore our complete product and service offerings.
              </p>
            </div>

            <button
              onClick={() => onNavigate("#products", true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-brand-blue px-6 py-3.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white hover:bg-graphite transition-all shadow-md cursor-pointer shrink-0"
            >
              <span>Shop All Connectors</span>
              <span>→</span>
            </button>
          </div>
        </Reveal>

        {/* Two Column Product Preview with Equal Visual Treatment */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Vertical 01: Distribution */}
          <Reveal delay={100}>
            <div className="group relative flex h-72 overflow-hidden rounded-2xl border border-border bg-graphite-deep transition-all duration-500 hover:shadow-[var(--shadow-lift)]">
              <img
                src={cardConnectors}
                alt="Electronic connectors distributed by Qualitech Connectronics, including Amphenol and Zolex connector solutions"
                title="Electronic Connectors – Qualitech India"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#004f9e]/90 via-graphite-deep/75 to-transparent" />
              <div className="relative flex flex-col justify-end p-8 w-full">
                <span className="inline-flex self-start rounded-full bg-brand-blue px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white">
                  Distribution
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  Electronics Components
                </h3>
                <p className="mt-1.5 text-sm text-white/80 font-medium">
                  Amphenol · Zolex
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onNavigate("#products", true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3.5 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white hover:text-brand-blue transition-colors cursor-pointer shadow-xs"
                  >
                    🛒 Shop 400+ Connectors Online →
                  </button>
                  <button
                    onClick={() => onNavigate("#amphenol", true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-colors cursor-pointer"
                  >
                    Amphenol Portal →
                  </button>
                  <button
                    onClick={() => onNavigate("#zolex", true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-colors cursor-pointer"
                  >
                    Zolex Portal →
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Vertical 02: Manufacturing */}
          <Reveal delay={200}>
            <div className="group relative flex h-72 overflow-hidden rounded-2xl border border-border bg-graphite-deep transition-all duration-500 hover:shadow-[var(--shadow-lift)]">
              <img
                src={cardFacilities}
                alt="Custom cable assemblies and wire harnesses manufactured by Qualitech Connectronics for OEM applications"
                title="Custom Cable Assemblies & Wire Harnesses – Qualitech India"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-graphite-deep/90 via-graphite-deep/75 to-transparent" />
              <div className="relative flex flex-col justify-end p-8 w-full">
                <span className="inline-flex self-start rounded-full bg-brand-yellow px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-graphite">
                  Manufacturing
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  Cable Assemblies
                </h3>
                <p className="mt-1.5 text-sm text-white/80 font-medium">
                  Custom wire harnesses · OEM solutions
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onNavigate("#manufacturing", true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3.5 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-graphite hover:bg-white transition-colors cursor-pointer"
                  >
                    Explore Capabilities →
                  </button>
                  <button
                    onClick={() => onNavigate("#contact-page", true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-colors cursor-pointer"
                  >
                    Request a Quote →
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */

function FinalCTA({ onNavigate }: { onNavigate?: (target: string) => void }) {
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
            Whether you need electronics components or a custom cable assembly solution - our team is here to help.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact-page"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("#contact-page");
              }}
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-graphite px-7 py-4 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue shadow-sm"
            >
              Request a Quote
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
            <a
              href="#contact-page"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("#contact-page");
              }}
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
              href="tel:+919849001484"
              className="mt-2 block font-display text-2xl font-bold text-graphite transition-colors duration-300 hover:text-brand-blue sm:text-3xl"
            >
              +91 98490 01484
            </a>
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
              <p>Telangana - 500051</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Root App Component & Multi-Page Router ─── */

type PageType = "home" | "products" | "about" | "manufacturing" | "qualitech" | "amphenol" | "zolex" | "contact" | "admin" | "privacy" | "terms" | "checkout" | "incomplete-payments";

function HomeContent() {
  const getPageFromHash = (): PageType => {
    if (typeof window === "undefined") return "home";
    const rawHash = window.location.hash.toLowerCase();
    const hash = rawHash.split("?")[0] || "";
    if (hash === "#admin" || hash === "#/admin" || hash === "#admin-panel") return "admin";
    if (
      hash === "#incomplete-payments" ||
      hash === "#/incomplete-payments" ||
      hash === "#abandoned-checkouts" ||
      hash === "#/abandoned-checkouts" ||
      hash === "#customer-leads" ||
      hash === "#/customer-leads" ||
      hash === "#leads"
    ) return "incomplete-payments";
    if (hash === "#checkout" || hash === "#/checkout" || hash === "#order-checkout") return "checkout";
    if (
      hash === "#products" ||
      hash === "#shop" ||
      hash === "#/shop" ||
      hash === "#catalog" ||
      hash === "#catalogue" ||
      hash.startsWith("#/connectors") ||
      hash.startsWith("#connectors") ||
      hash.startsWith("#/custom-cable-assemblies") ||
      hash.startsWith("#custom-cable-assemblies") ||
      hash.startsWith("#/high-speed-io-connectors") ||
      hash.startsWith("#high-speed-io-connectors") ||
      hash.startsWith("#/antennas") ||
      hash.startsWith("#antennas") ||
      hash.startsWith("#/product/") ||
      hash.startsWith("#product/")
    ) return "products";
    if (hash === "#about-page" || hash === "#about-us") return "about";
    if (hash === "#manufacturing" || hash === "#cable-assemblies" || hash === "#facilities") return "manufacturing";
    if (hash === "#qualitech") return "qualitech";
    if (hash === "#amphenol") return "amphenol";
    if (hash === "#zolex") return "zolex";
    if (hash === "#contact-page" || hash === "#contact-us" || hash === "#contact") return "contact";
    if (hash === "#privacy" || hash === "#privacy-policy") return "privacy";
    if (hash === "#terms" || hash === "#terms-of-service" || hash === "#terms-and-conditions") return "terms";
    return "home";
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromHash);

  useEffect(() => {
    if (currentPage === "home") {
      document.title = "Electronic Connectors & Cable Assembly Manufacturer in India";
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        descTag.setAttribute('content', 'Qualitech India distributes Amphenol and Zolex connectors and manufactures custom cable assemblies and wire harnesses for OEMs and industrial buyers across India.');
      }
    }
  }, [currentPage]);

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

  const handleNavigate = (target: string = "", isPage?: boolean | undefined) => {
    const cleanTarget = (target || "").toLowerCase().split("?")[0] || "";

    // Home / Top navigation
    if (cleanTarget === "#top" || cleanTarget === "" || cleanTarget === "#" || cleanTarget === "#home") {
      if (currentPage !== "home") {
        setCurrentPage("home");
      }
      window.history.pushState(null, "", window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#checkout" || cleanTarget === "#/checkout") {
      setCurrentPage("checkout");
      window.history.pushState(null, "", "#checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#admin" || cleanTarget === "#/admin" || cleanTarget === "#admin-panel") {
      setCurrentPage("admin");
      window.history.pushState(null, "", "#admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (
      cleanTarget === "#incomplete-payments" ||
      cleanTarget === "#/incomplete-payments" ||
      cleanTarget === "#abandoned-checkouts" ||
      cleanTarget === "#/abandoned-checkouts" ||
      cleanTarget === "#customer-leads" ||
      cleanTarget === "#/customer-leads" ||
      cleanTarget === "#leads"
    ) {
      setCurrentPage("incomplete-payments");
      window.history.pushState(null, "", "#incomplete-payments");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#products" || cleanTarget === "#shop" || cleanTarget === "#catalog" || cleanTarget === "#catalogue") {
      setCurrentPage("products");
      window.history.pushState(null, "", cleanTarget === "#shop" ? "#shop" : "#products");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#about-page" || cleanTarget === "#about-us") {
      setCurrentPage("about");
      window.history.pushState(null, "", "#about-page");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#manufacturing" || cleanTarget === "#cable-assemblies" || cleanTarget === "#facilities") {
      setCurrentPage("manufacturing");
      window.history.pushState(null, "", "#facilities");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#qualitech") {
      setCurrentPage("qualitech");
      window.history.pushState(null, "", "#qualitech");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#amphenol") {
      setCurrentPage("amphenol");
      window.history.pushState(null, "", "#amphenol");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#zolex") {
      setCurrentPage("zolex");
      window.history.pushState(null, "", "#zolex");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#contact-page" || cleanTarget === "#contact-us" || cleanTarget === "#contact") {
      setCurrentPage("contact");
      window.history.pushState(null, "", "#contact-page");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#privacy" || cleanTarget === "#privacy-policy") {
      setCurrentPage("privacy");
      window.history.pushState(null, "", "#privacy");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (cleanTarget === "#terms" || cleanTarget === "#terms-of-service" || cleanTarget === "#terms-and-conditions") {
      setCurrentPage("terms");
      window.history.pushState(null, "", "#terms");
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
  if (currentPage === "incomplete-payments") {
    return <AbandonedCheckoutsPage onNavigateHome={handleNavigate} />;
  }

  if (currentPage === "checkout") {
    return <CheckoutPage onNavigateHome={handleNavigate} />;
  }

  if (currentPage === "admin") {
    return <AdminPage onNavigateHome={handleNavigate} />;
  }

  if (currentPage === "products") {
    return <ShopPage onNavigateHome={handleNavigate} />;
  }

  if (currentPage === "about") {
    return <AboutPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "manufacturing") {
    return <ManufacturingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "qualitech") {
    return <QualitechPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "amphenol") {
    return <AmphenolPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "zolex") {
    return <ZolexPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "contact") {
    return <ContactPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "privacy") {
    return <PrivacyPolicyPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "terms") {
    return <TermsPage onNavigate={handleNavigate} />;
  }

  // Home Page
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={handleNavigate} currentPage="home" />
      <main>
        <Hero onNavigate={handleNavigate} />
        <Stats />
        <BusinessStructure onNavigate={handleNavigate} />
        <About onNavigate={handleNavigate} />
        <Industries />
        <Why />
        <FacilitiesPreview onNavigate={handleNavigate} />
        <ProductsOverview onNavigate={handleNavigate} />
        <FinalCTA onNavigate={handleNavigate} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
