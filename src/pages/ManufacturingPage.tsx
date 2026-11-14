import { useEffect } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, ShieldCheck, Cpu, Building2, MapPin } from "lucide-react";

interface ManufacturingPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

const FACILITY_IMAGES = [
  {
    file: "fully-automatic-crimping-machine-cable-assembly.jpg",
    name: "Fully Automatic Crimping Machines",
    alt: "Fully automatic crimping machine used for cable assembly manufacturing at Qualitech",
    title: "Fully Automatic Crimping Machine – Qualitech",
  },
  {
    file: "fully-automatic-wire-cutting-machine.jpg",
    name: "Fully Automatic Cutting Machines",
    alt: "Fully automatic wire cutting machine used for cable assembly production at Qualitech",
    title: "Fully Automatic Wire Cutting Machine – Qualitech",
  },
  {
    file: "semi-automatic-crimping-machine-cable-assembly.jpg",
    name: "Semi-Automatic Crimping Machines",
    alt: "Semi-automatic crimping machine for cable and wire harness manufacturing at Qualitech",
    title: "Semi-Automatic Crimping Machine – Qualitech",
  },
  {
    file: "hydraulic-crimping-machine-cable-assembly.jpg",
    name: "Hydraulic Crimping Machines",
    alt: "Hydraulic crimping machine used for cable assembly and wire harness production at Qualitech",
    title: "Hydraulic Crimping Machine – Qualitech",
  },
  {
    file: "pneumatic-automation-tools-cable-assembly.jpg",
    name: "Pneumatic Automation Tools",
    alt: "Pneumatic automation tools used in cable assembly and wire harness manufacturing",
    title: "Pneumatic Automation Tools – Qualitech",
  },
  {
    file: "automated-cable-assembly-testing-equipment-jigs.jpg",
    name: "Automated Testing Eq. and Jigs",
    alt: "Automated testing equipment and jigs used for cable assembly quality testing at Qualitech",
    title: "Automated Cable Assembly Testing Equipment & Jigs",
  },
  {
    file: "motorised-pull-testing-machine-cable-assembly.jpg",
    name: "Motorised Pull Testing Eq.",
    alt: "Motorised pull testing equipment used to verify cable and wire harness connections",
    title: "Motorised Pull Testing Equipment – Qualitech",
  },
  {
    file: "crimp-cross-section-analysis-lab.jpg",
    name: "Crimp Cross Section Analysis Lab",
    alt: "Crimp cross-section analysis equipment used for cable assembly quality inspection",
    title: "Crimp Cross-Section Analysis Lab – Qualitech",
  },
  {
    file: "software-aided-job-tracking-cable-assembly.jpg",
    name: "Software Aided Job Tracking",
    alt: "Software-aided job tracking system used for cable assembly production management",
    title: "Software-Aided Job Tracking – Qualitech",
  },
  {
    file: "wire-twisting-machine-cable-assembly.jpg",
    name: "Twisting Machine",
    alt: "Wire twisting machine used in cable assembly and wire harness manufacturing",
    title: "Wire Twisting Machine – Qualitech",
  },
  {
    file: "tinning-pot-wire-processing.jpg",
    name: "Tinning Pot",
    alt: "Tinning pot used for wire processing and cable assembly manufacturing at Qualitech",
    title: "Tinning Pot – Qualitech",
  },
];

export function ManufacturingPage({ onNavigate }: ManufacturingPageProps) {
  useEffect(() => {
    document.title = "Facilities & Cable Assembly Manufacturing in Hyderabad | Qualitech";
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', "Explore Qualitech's cable assembly facility in Hyderabad with automated wire processing, crimping, testing equipment and production capabilities for OEM applications.");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const CAPABILITIES = [
    {
      title: "Custom Wire Harnesses",
      subtitle: "Multi-branch point-to-point loom assemblies",
      desc: "Engineered specifically for your chassis envelope. Features automated wire stripping, crimping, braided sleeving, and custom laser-marked wire identification.",
      image: "/images/products/qualitech/custom-multi-branch-wire-harness-assembly.png",
      alt: "Custom multi-branch wire harness assembly manufactured by Qualitech",
      imgTitle: "Custom Multi-Branch Wire Harness Assembly – Qualitech",
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
      image: "/images/products/qualitech/flat-ribbon-data-cable-assembly-idc.png",
      alt: "Custom flat ribbon and data cable assembly with IDC termination for electronic modules",
      imgTitle: "Flat Ribbon & Data Cable Assembly – Qualitech",
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
      image: "/images/products/qualitech/rf-coaxial-cable-assembly-sma-bnc.png",
      alt: "RF and coaxial cable assembly with high-frequency connectors for electronic applications",
      imgTitle: "RF & Coaxial Cable Assembly – Qualitech",
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
      image: "/images/products/qualitech/high-current-power-cable-assembly-terminal-block.png",
      alt: "High-current power cable assembly with terminal block for industrial applications",
      imgTitle: "High-Current Power Cable Assembly – Qualitech",
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
      image: "/images/products/qualitech/military-38999-ruggedized-cable-assembly.png",
      alt: "Ruggedized military cable assembly with MIL-DTL-38999 connectors for harsh environments",
      imgTitle: "Military 38999 Cable Assembly – Qualitech",
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
      image: "/images/products/qualitech/braided-long-run-industrial-wire-harness.png",
      alt: "Braided long-run industrial wire harness manufactured for industrial applications",
      imgTitle: "Braided Long-Run Industrial Wire Harness – Qualitech",
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
              Cable Assembly Manufacturing Facility &amp; Machinery
            </h1>
            <p className="mt-3 font-display text-lg sm:text-xl font-semibold text-brand-yellow">
              Advanced Manufacturing &amp; Testing Infrastructure in Hyderabad
            </p>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Our state-of-the-art plant at Phase-V IDA Cherlapally, Hyderabad houses modern automated wire processing machines, precision crimping presses, ultrasonic welders, and 100% computerized circuit test benches.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 1. Facility Images Gallery (Plant Machinery & Equipment) ─── */}
      <section className="py-20 lg:py-24 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="h-px w-10 bg-brand-yellow inline-block" />
                <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Cable Assembly Manufacturing Machinery &amp; Equipment
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
            {FACILITY_IMAGES.map((item, idx) => (
              <Reveal key={item.file} delay={idx * 50}>
                <div className="group rounded-2xl border border-border bg-white overflow-hidden shadow-xs hover:border-brand-blue/50 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="overflow-hidden aspect-[4/3] bg-steel-light/30">
                    <img
                      src={`/images/products/facilities/${item.file}`}
                      alt={item.alt}
                      title={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 font-display text-xs font-bold text-brand-blue shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-sm font-bold text-graphite leading-snug">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. Manufactured Cable Solutions ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="h-px w-10 bg-brand-orange inline-block" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Custom Cable Assembly &amp; Wire Harness Manufacturing
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
                      alt={cap.alt}
                      title={cap.imgTitle}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
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

      {/* ─── 3. Quality Testing for Cable Assemblies & Wire Harnesses ─── */}
      <section className="py-20 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <span className="h-px w-10 bg-brand-yellow inline-block" />
              <div className="mt-3">
                <span className="label-eyebrow">Quality &amp; Compliance</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Quality Testing for Cable Assemblies &amp; Wire Harnesses
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every wire harness and custom cable assembly manufactured by Qualitech undergoes multi-stage electrical and mechanical verification to ensure zero defects and high reliability in demanding environments.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Automated Continuity Testing",
                desc: "100% computerized circuit verification checks every connection against electrical schematics to eliminate open circuits and shorts.",
              },
              {
                title: "Pin-Out Verification",
                desc: "Automated multi-pin harness testers verify accurate terminal mapping and wire sequence across multi-branch looms.",
              },
              {
                title: "Pull-Force Testing",
                desc: "Digital pull testers calibrate terminal crimp retention force to UL, IPC/WHMA-A-620 and MIL specifications.",
              },
              {
                title: "Dielectric & Hipot Testing",
                desc: "High-voltage insulation resistance and dielectric withstand tests confirm safety and barrier insulation up to specified voltages.",
              },
              {
                title: "Crimp Cross-Section Inspection",
                desc: "Micrographic laboratory analysis of crimp cross-sections to inspect compaction, strand distribution, and terminal symmetry.",
              },
              {
                title: "Traceability & Inspection Reports",
                desc: "Full batch serialization, calibrated equipment logs, and First Article Inspection Reports (FAIR) provided with each delivery.",
              },
            ].map((t, idx) => (
              <Reveal key={t.title} delay={idx * 60}>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-xs h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <h3 className="font-display text-base font-bold text-graphite">{t.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Cable Assembly Manufacturing Facility in Hyderabad ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <Reveal>
              <div>
                <span className="h-px w-10 bg-brand-orange inline-block" />
                <div className="mt-3">
                  <span className="label-eyebrow">Facility &amp; Location</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Cable Assembly Manufacturing Facility in Hyderabad
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Located in Phase-V IDA, Cherlapally, Hyderabad, Qualitech operates an ISO 9001 certified cable assembly manufacturing facility serving OEMs across India. Our infrastructure combines automated wire processing equipment, dedicated assembly lines, and calibrated electrical test benches.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-graphite font-medium">
                      Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Telangana – 500051, India
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Dedicated production floor with ESD-compliant assembly workstations and clean packaging areas.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cpu className="h-5 w-5 text-brand-yellow shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Full-spectrum OEM support from prototype wire harnesses to high-volume recurring cable production runs.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => onNavigate("#contact-page", true)}
                    className="rounded-xl bg-graphite px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
                  >
                    Request a Custom Cable Quote →
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-3xl bg-graphite-deep text-white p-8 sm:p-12">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow">
                  Cherlapally Industrial Zone
                </span>
                <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
                  Strategic Hyderabad Manufacturing Hub
                </h3>
                <p className="mt-3 text-sm text-steel leading-relaxed">
                  Our strategic location in Hyderabad's premier industrial corridor provides excellent logistical connectivity for rapid prototype turnaround and reliable nationwide component and harness dispatch.
                </p>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                  <div>
                    <p className="text-2xl font-bold font-display text-white">100%</p>
                    <p className="text-[0.7rem] uppercase tracking-wider text-steel">Tested Dispatches</p>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <p className="text-2xl font-bold font-display text-brand-yellow">30+ Yrs</p>
                    <p className="text-[0.7rem] uppercase tracking-wider text-steel">Manufacturing Experience</p>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <p className="text-2xl font-bold font-display text-white">ISO 9001</p>
                    <p className="text-[0.7rem] uppercase tracking-wider text-steel">Certified Facility</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-graphite">
              Ready to Discuss Your Cable Assembly or Harness Project?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Our engineering and manufacturing specialists in Hyderabad are ready to review your technical drawings and provide a competitive quote.
            </p>
            <div className="mt-8">
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="rounded-xl bg-brand-yellow px-8 py-4 font-display text-xs font-extrabold uppercase tracking-widest text-graphite-deep hover:bg-graphite hover:text-white transition-all shadow-md cursor-pointer"
              >
                Request a Custom Cable Quote →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
