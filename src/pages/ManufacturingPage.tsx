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

export function ManufacturingPage({ onNavigate }: ManufacturingPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const CAPABILITIES = [
    {
      title: "Custom Wire Harnesses",
      subtitle: "Multi-branch point-to-point loom assemblies",
      desc: "Engineered specifically for your chassis envelope. Features automated wire stripping, crimping, braided sleeving, and custom laser-marked wire identification.",
      image: heroHarness,
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
      image: cardCable,
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
      image: indPower,
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
      image: indDefense,
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
      image: cardFacilities,
      features: [
        "First-article inspection & micrographic crimp checks",
        "Fast-track sample build for NPI validation",
        "Full batch serialization & barcode tracking",
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
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                Manufacturing Capabilities
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Manufacturing of Custom Cable Assemblies &amp; Wire Harnesses
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              In-house manufacturing of precision-engineered wire harnesses, coaxial RF leads, and power assemblies tailored to your exact OEM specifications. 100% electrically tested.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Capabilities Grid ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="h-px w-10 bg-brand-orange inline-block" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Our Manufacturing Products &amp; Solutions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Customized wire harnessing and cable assembly solutions engineered for critical applications.
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
                      onClick={() => onNavigate("#contact", true)}
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
              onClick={() => onNavigate("#contact", true)}
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
