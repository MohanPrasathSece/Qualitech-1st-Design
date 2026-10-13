import { useEffect } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import cardCable from "@/assets/card-cable-assemblies.jpg";
import heroHarness from "@/assets/hero-harness.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import cardConnectors from "@/assets/card-connectors.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indPower from "@/assets/ind-power.jpg";
import p4 from "@/assets/p4.jpg";

interface ManufacturingPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

const MACHINERY_LIST = [
  {
    name: "Automated Wire Cut & Strip Machines",
    category: "Wire Processing",
    specs: "Microprocessor-controlled high-speed wire cutting and stripping from 0.05 mm² to 35 mm² with ultra-tight length tolerance.",
    tag: "High-Speed Automated",
  },
  {
    name: "Precision Terminal Crimping Presses",
    category: "Terminal Crimping",
    specs: "Motorized & pneumatic benchtop crimping presses with quick-change mini-applicators and micro-calibrated crimp force monitoring.",
    tag: "Calibrated Applicators",
  },
  {
    name: "Computerized Cable Harness Circuit Testers",
    category: "Electrical Testing",
    specs: "Multi-point programmable continuity, short-circuit, and pinout verification with automatic test report and batch serialization.",
    tag: "100% Circuit Tested",
  },
  {
    name: "High Voltage Hipot & Dielectric Breakdown Test Stations",
    category: "Safety Assurance",
    specs: "AC/DC Hipot insulation resistance testing up to 5 kV ensuring zero dielectric breakdown for defense and railway harness specs.",
    tag: "Up to 5 kV Dielectric Test",
  },
  {
    name: "Ultrasonic Metal Wire Splicing Systems",
    category: "Wire Bonding",
    specs: "Solid-state ultrasonic metal bonding producing zero-resistance, flux-free metallurgical welds for automotive and power feeds.",
    tag: "Solid-State Splicing",
  },
  {
    name: "Thermal Heat-Shrink Tunnels & Hot Air Stations",
    category: "Insulation & Sealing",
    specs: "Infrared conveyor ovens and digital hot air stations for 360° uniform adhesive flow and IP67/IP68 submersible sealing.",
    tag: "Uniform 360° Sealing",
  },
  {
    name: "Motorized Digital Pull-Force Tensile Testers",
    category: "Mechanical Verification",
    specs: "Calibrated digital pull gauges up to 2000 N ensuring terminal crimp pull-off strength strictly complies with IPC/WHMA-A-620.",
    tag: "IPC/WHMA-A-620 Class 3",
  },
  {
    name: "Optical Micrographic Crimp Inspection Station",
    category: "Quality Inspection",
    specs: "High-magnification video inspection and cutting fixture to audit terminal crimp height, compaction, and strand distribution.",
    tag: "Crimp Height Audited",
  },
  {
    name: "Heavy-Duty Loom Braiding & Shielding Machines",
    category: "Abrasion & EMI Shielding",
    specs: "Multi-spindle braiding machines applying tight-pitch nylon, Nomex, and tin-plated copper braid for rugged defense looms.",
    tag: "Rugged Braided Harnesses",
  },
  {
    name: "ESD-Protected Workstations & Plant Infrastructure",
    category: "Plant Environment",
    specs: "Static-dissipative workstations with continuous wrist-strap monitors, ionizing blowers, and grounded flooring conforming to ANSI/ESD S20.20.",
    tag: "ESD Safe Floor",
  },
];

export function ManufacturingPage({ onNavigate }: ManufacturingPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const CAPABILITIES = [
    {
      title: "Custom Wire Harnesses",
      subtitle: "Multi-branch point-to-point loom assemblies",
      desc: "Engineered specifically for your chassis envelope. Features automated wire stripping, crimping, braided sleeving, and custom laser-marked wire identification.",
      image: "/images/products/qualitech/qt-harn-multibranch-power.png",
      features: [
        "100% electrical continuity & hipot testing",
        "Braided nylon, Nomex or PVC protective jacketing",
        "UL / MIL-spec heat shrink strain relief",
      ],
    },
    {
      title: "Flat Ribbon & Data Cable Assemblies",
      subtitle: "IDC, FRC & high-speed internal bus links",
      desc: "Custom length flat ribbon cable terminated with dual IDC sockets, EMI foil shielding, and drain wires for high-density electronic modules and daughterboards.",
      image: "/images/products/qualitech/qt-ca-ribbon-multibranch.png",
      features: [
        "Gas-tight insulation displacement termination",
        "Aluminum foil shielding against EMI/RFI noise",
        "Pitch options from 0.635mm to 2.54mm",
      ],
    },
    {
      title: "RF & Coaxial Cable Assemblies",
      subtitle: "Low-loss 50Ω & 75Ω high-frequency leads",
      desc: "Precision RF coaxial leads with gold-plated SMA, BNC, N-Type, and TNC connectors, factory tested to tight VSWR specifications up to 6 GHz.",
      image: p4,
      features: [
        "Silver-plated copper conductors & PTFE dielectrics",
        "Phase-matched pairs available upon request",
        "Low VSWR return loss verification reports",
      ],
    },
    {
      title: "High-Current Power Harnesses",
      subtitle: "DC power feeds & battery interconnects",
      desc: "Heavy-duty flexible power leads with hydraulic-crimped ring lugs and double-wall adhesive heat shrink for solar inverters, battery packs, and EV chargers.",
      image: "/images/products/qualitech/qt-ca-pwr-terminal-block.png",
      features: [
        "Class K ultra-flexible stranded copper leads",
        "Continuous current carrying capacity up to 200A",
        "Flame retardant & oil-resistant jackets",
      ],
    },
    {
      title: "Defense & Railway Grade Harnesses",
      subtitle: "Ruggedized harsh-environment assemblies",
      desc: "Hermetically sealed military cable assemblies with stainless steel backshells, tin-plated copper overbraid shielding and silicone grommets.",
      image: "/images/products/qualitech/qt-ca-mil-conduit-38999.png",
      features: [
        "IP67 / IP68 submersible ingress protection",
        "MIL-DTL-38999 & MIL-DTL-26482 compliance",
        "Certified to IPC/WHMA-A-620 Class 3",
      ],
    },
    {
      title: "Turnkey OEM Solutions",
      subtitle: "Prototyping, DFM & volume production",
      desc: "Complete design-in support, BOM rationalization, harness routing optimization, first-article inspection reports (FAIR), and volume manufacturing.",
      image: "/images/products/qualitech/qt-harn-braided-longrun.png",
      features: [
        "First-article inspection & micrographic crimp checks",
        "Fast-track sample build for NPI validation",
        "Full batch serialization & barcode tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="facilities" />

      {/* ─── Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                Facilities &amp; Infrastructure
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Facilities &amp; Manufacturing Machinery
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Our state-of-the-art plant at Phase-V IDA Cherlapally, Hyderabad houses modern automated wire processing machines, precision crimping presses, ultrasonic welders, and 100% computerized circuit test benches.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Live Plant Machinery Section ─── */}
      <section className="py-20 lg:py-24 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="h-px w-10 bg-brand-yellow inline-block" />
                <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Plant Machinery &amp; Equipment
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                  Advanced production machinery and testing equipment powering our zero-defect cable harnessing and component assembly lines.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white border border-border px-3.5 py-2 shadow-2xs shrink-0 self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-display text-xs font-bold text-graphite">ISO 9001:2015 Plant</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MACHINERY_LIST.map((mach, idx) => (
              <Reveal key={mach.name} delay={idx * 60}>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-xs hover:border-brand-blue/50 hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-lg bg-brand-blue/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-brand-blue">
                        {mach.category}
                      </span>
                      <span className="text-[0.65rem] font-bold text-emerald-600 font-mono">
                        {mach.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-graphite leading-snug">
                      {mach.name}
                    </h3>
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                      {mach.specs}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[0.68rem] text-graphite/70 font-semibold">
                    <span>Cherlapally Plant Unit</span>
                    <span className="text-brand-blue">Operational &bull;</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Capabilities Grid ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="h-px w-10 bg-brand-orange inline-block" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Manufactured Cable Solutions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Customized wire harnessing and cable assembly solutions engineered on our production floor for critical applications.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 90}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                  <div className="overflow-hidden h-52 bg-steel-light">
                    <img
                      src={cap.image}
                      alt={cap.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-blue">
                      {cap.subtitle}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-graphite">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {cap.desc}
                    </p>

                    <ul className="mt-5 space-y-2 border-t border-border/80 pt-4">
                      {cap.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-graphite font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => onNavigate("#contact-page", true)}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-graphite px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-blue cursor-pointer"
                    >
                      <span>Discuss Requirement</span>
                      <span>→</span>
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quality Standards ─── */}
      <section className="py-20 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl bg-graphite-deep text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow">Quality Assurance</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
                100% Electrically Tested Before Dispatch
              </h3>
              <p className="mt-3 text-sm text-steel leading-relaxed">
                Every wire harness and custom assembly produced by Qualitech undergoes automated continuity, pin-out verification, pull-force verification, and high-voltage dielectric tests.
              </p>
            </div>
            <button
              onClick={() => onNavigate("#contact-page", true)}
              className="rounded-xl bg-brand-yellow px-8 py-4 font-display text-xs font-extrabold uppercase tracking-widest text-graphite hover:bg-white transition-all shadow-md shrink-0 cursor-pointer"
            >
              Request a Custom Quote →
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
