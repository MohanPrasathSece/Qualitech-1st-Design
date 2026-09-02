import { useState, useEffect } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p6 from "@/assets/p6.jpg";
import cardConnectors from "@/assets/card-connectors.jpg";
import indPower from "@/assets/ind-power.jpg";

interface ZolexPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function ZolexPage({ onNavigate }: ZolexPageProps) {
  const [openSection, setOpenSection] = useState<string>("industrial-connectors");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const PRODUCT_SECTIONS = [
    {
      id: "industrial-connectors",
      name: "Industrial Connectors",
      tagline: "Heavy-Duty, Sensor & Field-Attachable Circular Connectors",
      desc: "Zolex delivers high-performance industrial connector solutions engineered for harsh industrial automation, field instrumentation, and power distribution systems.",
      items: [
        {
          name: "Industrial Circular & Sensor Connectors",
          series: "M12 / M8 / M16 Series",
          desc: "IP67 sealed industrial sensor and actuator connectors with screw, crimp, and push-pull terminations.",
          image: p3,
          specs: "IP67 / IP68 · A/B/D-Coded · Industrial Automation",
        },
        {
          name: "Heavy-Duty Multipole Connectors",
          series: "HD Series Rectangular",
          desc: "Rugged die-cast aluminum housing multipole power and signal connectors for machinery and control panels.",
          image: p6,
          specs: "Up to 500V / 16A · IP65 Hoods & Housings",
        },
        {
          name: "Waterproof Cable Connectors",
          series: "WP-Lock Quick Disconnect",
          desc: "Quick-connect bayonet and threaded waterproof inline connectors for outdoor and harsh factory environments.",
          image: cardConnectors,
          specs: "UV-Resistant · IP68 Submersible · Quick-Lock",
        },
      ],
    },
    {
      id: "terminal-blocks",
      name: "Terminal Blocks & DIN-Rail",
      tagline: "Modular DIN-Rail Terminal Blocks & Distribution Systems",
      desc: "Comprehensive DIN-rail connection solutions including push-in, screw clamp, and spring cage terminal blocks for electrical control panels.",
      items: [
        {
          name: "Push-In DIN-Rail Terminal Blocks",
          series: "ZK Push-In Series",
          desc: "Tool-free fast wiring terminal blocks with integrated test points and jumper channels for rapid panel building.",
          image: p2,
          specs: "0.2mm² - 16mm² · Push-In Technology · DIN-Rail 35mm",
        },
        {
          name: "Screw-Clamp Feed-Through Blocks",
          series: "STB High-Torque Series",
          desc: "Vibration-proof screw clamp terminals engineered for high clamping force and long-term electrical reliability.",
          image: p4,
          specs: "600V Rated · UL94 V-0 Flame Retardant",
        },
        {
          name: "Power Distribution Blocks",
          series: "PDB Modular Units",
          desc: "Compact multi-pole power distribution blocks for splitting main power feeds across control sub-circuits.",
          image: indPower,
          specs: "Up to 160A / 1000V · Finger-Safe IP20 Touch Proof",
        },
      ],
    },
    {
      id: "pcb-interconnects",
      name: "PCB Interconnects & Headers",
      tagline: "Board-to-Board, Wire-to-Board & Pluggable Terminal Blocks",
      desc: "High-density PCB interconnects, pin headers, and Eurostyle pluggable terminal blocks for electronic assemblies and embedded systems.",
      items: [
        {
          name: "Pluggable PCB Terminal Blocks",
          series: "Eurostyle 3.81mm / 5.08mm",
          desc: "Two-piece plug and header connectors enabling swift field replacement and modular electronic assembly.",
          image: p6,
          specs: "3.5mm, 3.81mm, 5.0mm, 5.08mm Pitch · 300V/15A",
        },
        {
          name: "Pin & Box Headers",
          series: "0.1\" (2.54mm) & 2.0mm Pitch",
          desc: "Straight and right-angle PCB pin headers with gold or tin plating for reliable board-to-board interconnects.",
          image: p2,
          specs: "Single & Dual Row · SMT & Through-Hole Options",
        },
        {
          name: "Screw PCB Terminal Blocks",
          series: "Miniature Fixed Blocks",
          desc: "Compact low-profile fixed PCB terminal blocks for space-constrained industrial electronics and IoT boards.",
          image: p3,
          specs: "High Torque · Copper Alloy Terminals · UL Approved",
        },
      ],
    },
    {
      id: "wiring-accessories",
      name: "Wiring Ducts & Cable Management",
      tagline: "Slotted Wiring Ducts, Cable Glands & Panel Accessories",
      desc: "Engineered panel-building accessories ensuring clean cable routing, strain relief, and environmental sealing in industrial enclosures.",
      items: [
        {
          name: "Slotted Industrial Wiring Ducts",
          series: "PVC & Halogen-Free Ducts",
          desc: "High-impact rigid PVC slotted wire raceways with snap-on covers for neat control cabinet wire organization.",
          image: cardConnectors,
          specs: "Wide & Narrow Slot · UL94 V-0 Self-Extinguishing",
        },
        {
          name: "Metallic & Nylon Cable Glands",
          series: "PG & Metric IP68 Glands",
          desc: "Nickel-plated brass and polyamide cable glands providing superior strain relief and IP68 ingress sealing.",
          image: p4,
          specs: "IP68 Dust & Water Proof · Spiral Strain Relief",
        },
        {
          name: "Cable Ties & Protective Sleeving",
          series: "Industrial Grade Fasteners",
          desc: "UV-resistant nylon 6/6 cable ties, expandable braided sleeving, and spiral wraps for harness bundling.",
          image: p2,
          specs: "Operating Temp -40°C to +85°C · High Tensile Strength",
        },
      ],
    },
    {
      id: "relays-modules",
      name: "Relays & Interface Modules",
      tagline: "Industrial Relay Modules & Signal Conditioning",
      desc: "Compact DIN-rail interface relays and optocoupler modules for electrical isolation, signal amplification, and PLC interfacing.",
      items: [
        {
          name: "Slim Interface Relay Modules",
          series: "6.2mm Ultra-Slim Series",
          desc: "High-density pluggable relays with LED status indicators and integrated freewheeling protection diodes.",
          image: p4,
          specs: "6.2mm Width · 24VDC / 230VAC Coil Options · 6A SPDT",
        },
        {
          name: "Multi-Channel Relay Boards",
          series: "4 / 8 / 16 Channel Modules",
          desc: "Pre-wired DIN-rail mount relay boards for direct interfacing with PLC I/O cards and CNC controllers.",
          image: p6,
          specs: "Optocoupler Isolated · Independent Fuse Protection",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="products" />

      {/* ─── Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-blue" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                Authorized Distribution
              </span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="rounded-2xl bg-brand-blue p-3.5 shadow-md inline-flex items-center justify-center text-white font-display font-extrabold text-2xl h-14 w-14">
                Z
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                  Zolex Components
                </h1>
                <p className="mt-1 font-display text-xs sm:text-sm font-semibold text-brand-blue-soft uppercase tracking-wider">
                  Industrial Connectors · Terminal Blocks · Wiring Ducts · Relays
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Qualitech Connectronics is an authorized distribution partner for Zolex industrial electronics and interconnect components in India. Sourced directly with verified quality, local stock availability, and complete engineering support for OEMs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-all shadow-md cursor-pointer"
              >
                <span>Request Zolex Quote</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
              <button
                onClick={() => onNavigate("#products", true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <span>Browse All Products</span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Highlights / Value Proposition Strip ─── */}
      <section className="border-b border-border bg-steel-light/40 py-8 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              ✓
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">100% Genuine</h4>
              <p className="text-[0.72rem] text-muted-foreground">Direct authorized sourcing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              ⚡
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">Local Stock</h4>
              <p className="text-[0.72rem] text-muted-foreground">Fast dispatch from Hyderabad</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              ⚙
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">OEM Integration</h4>
              <p className="text-[0.72rem] text-muted-foreground">Kitting with cable harnesses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              📋
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">Full Datasheets</h4>
              <p className="text-[0.72rem] text-muted-foreground">Technical compliance & test reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Product Category Showcase ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="h-px w-10 bg-brand-blue inline-block" />
                <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Zolex Product Lines
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a category to explore components, specifications, and applications.
                </p>
              </div>

              {/* Category selector tabs */}
              <div className="flex flex-wrap gap-2">
                {PRODUCT_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setOpenSection(sec.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      openSection === sec.id
                        ? "bg-brand-blue text-white shadow-xs font-bold"
                        : "border border-border bg-steel-light/60 text-graphite hover:bg-white"
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Active Category Display */}
          {PRODUCT_SECTIONS.map((sec) => {
            if (sec.id !== openSection) return null;

            return (
              <div key={sec.id} className="mt-12 animate-in fade-in duration-300">
                <div className="rounded-2xl bg-steel-light/60 border border-border p-6 sm:p-8 mb-8">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue">
                    Zolex Series
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-graphite">
                    {sec.name} — {sec.tagline}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    {sec.desc}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sec.items.map((item) => (
                    <article
                      key={item.name}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="h-44 bg-steel-light/50 p-4 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <span className="text-[0.62rem] font-mono font-semibold text-brand-blue">
                          {item.series}
                        </span>
                        <h4 className="mt-1 font-display text-sm font-bold text-graphite">
                          {item.name}
                        </h4>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>

                        <div className="mt-3 rounded-lg bg-steel-light/60 px-3 py-1.5 text-[0.68rem] font-mono text-graphite">
                          {item.specs}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/80">
                          <button
                            onClick={() => onNavigate("#contact-page", true)}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-graphite transition-colors cursor-pointer"
                          >
                            <span>Enquire / Request Quote</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Contact Banner ─── */}
      <section className="py-20 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-graphite">
            Looking for Specific Zolex Part Numbers or Volume Pricing?
          </h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Qualitech Connectronics provides authorized Zolex supply with technical validation, sample kits, and timely delivery across India.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate("#contact-page", true)}
              className="rounded-xl bg-graphite px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
            >
              Enquire for Zolex Components →
            </button>
            <button
              onClick={() => onNavigate("#products", true)}
              className="rounded-xl border border-border bg-white px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-graphite hover:bg-steel-light transition-colors cursor-pointer"
            >
              Browse All Products &amp; Services
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
