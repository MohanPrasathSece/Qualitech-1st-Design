import { useState, useEffect } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";

interface AmphenolPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function AmphenolPage({ onNavigate }: AmphenolPageProps) {
  const [openSection, setOpenSection] = useState<string>("connectors");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const PRODUCT_SECTIONS = [
    {
      id: "connectors",
      name: "Connectors",
      tagline: "Circular MIL-Spec, Industrial, D-Sub & PCB Interconnects",
      desc: "Amphenol is a global leader in interconnect systems. Qualitech supplies genuine Amphenol connectors engineered for harsh environments, high-density backplanes, and critical industrial electronics.",
      items: [
        {
          name: "Circular MIL-Spec Connectors",
          series: "MIL-DTL-38999 / MIL-DTL-26482",
          desc: "Ruggedized circular connectors with bayonet and threaded couplings for defence and aerospace.",
          image: p1,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "Industrial Circular Connectors",
          series: "M12 / M8 / Heavy-Duty C-Series",
          desc: "IP67/IP68 sealed circular connectors for factory automation, robotic sensors, and fieldbuses.",
          image: p3,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "D-Subminiature Connectors",
          series: "Standard & High-Density D-Sub",
          desc: "Stamped and machined pin D-sub connectors with EMI shielding for data communications.",
          image: p2,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "PCB & Board-to-Board Headers",
          series: "High-Speed Backplane & Mezzanine",
          desc: "High-density differential pair connectors and PCB headers for computing and control racks.",
          image: p6,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
      ],
    },
    {
      id: "antennas",
      name: "Antennas",
      tagline: "High-Precision GNSS, Cellular 5G & IoT Antennas",
      desc: "Amphenol's antenna solutions deliver superior RF performance, gain, and multi-constellation coverage across global frequency bands.",
      items: [
        {
          name: "High Precision GNSS Antennas",
          series: "GPS / GLONASS / Galileo / BeiDou",
          desc: "Active multi-band GNSS antennas with integrated LNA for sub-meter navigation and timing.",
          image: p1,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "5G & 4G LTE Cellular Antennas",
          series: "600 MHz - 6 GHz Sub-6GHz",
          desc: "Low-profile outdoor puck and panel antennas for telematics kiosks, smart meters, and routers.",
          image: p2,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "Wi-Fi & Bluetooth Dipoles",
          series: "2.4 GHz / 5.8 GHz Dual-Band",
          desc: "Articulated rubber duck and terminal antennas for industrial gateways and wireless APs.",
          image: p3,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "Internal Embedded FPC Antennas",
          series: "NB-IoT / LoRa / LTE-M",
          desc: "Ultra-thin flexible peel-and-stick antennas with IPEX micro coaxial leads for compact devices.",
          image: p4,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
      ],
    },
    {
      id: "rf",
      name: "RF & Coaxial Solutions",
      tagline: "Precision RF Connectors, Adapters & Coaxial Leads",
      desc: "Engineered for uncompromising high-frequency signal integrity across telecom, satellite communications, and defence test equipment.",
      items: [
        {
          name: "RF Coaxial Connectors",
          series: "SMA / BNC / N-Type / TNC",
          desc: "50Ω & 75Ω precision coaxial connectors with gold-plated contacts and PTFE dielectrics.",
          image: p4,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "Precision RF Cable Assemblies",
          series: "Low-Loss Micro-Coax Leads",
          desc: "Factory verified VSWR performance for radar, wireless base stations, and RF test racks.",
          image: p5,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
      ],
    },
    {
      id: "fiber",
      name: "Fiber Optic Solutions",
      tagline: "High-Density Optical Connectors & Patch Cords",
      desc: "Single-mode and multi-mode optical interconnects designed for low insertion loss in demanding telecom and high-speed data environments.",
      items: [
        {
          name: "Fiber Connectors & Adapters",
          series: "LC / SC / MTP / MPO",
          desc: "Zirconia ceramic ferrule optical connectors engineered for minimal signal attenuation.",
          image: indTelecom,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
        },
        {
          name: "Optical Patch Cords",
          series: "Duplex Single-Mode (9/125µm)",
          desc: "Armored LSZH fiber patch leads for telecom exchanges, substations, and data centers.",
          image: p3,
          url: "https://www.amphenol-cs.com/product-series/gnss.html",
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
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                Authorized Distribution
              </span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="rounded-2xl bg-white p-3 shadow-md inline-block">
                <svg className="h-10 w-10 text-[#004f9e]" viewBox="0 0 32 32" fill="currentColor">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 16c2-6 6-6 8 0s6 6 8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Amphenol
              </h1>
            </div>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Qualitech Connectronics is a trusted distribution partner for Amphenol electronics components. Explore Amphenol's world-renowned product series below, with direct access to official product documentation.
            </p>

            <div className="mt-8">
              <a
                href="https://www.amphenol-cs.com/product-series/gnss.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#004f9e] px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-all shadow-md"
              >
                <span>Visit Amphenol Official Portal</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Interactive Product Category Dropdowns / Accordions ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="h-px w-10 bg-brand-orange inline-block" />
                <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Amphenol Product Lines
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a category to view product series and direct official catalog links.
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
                        ? "bg-[#004f9e] text-white shadow-xs font-bold"
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
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#004f9e]">
                    Amphenol Series
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-graphite">
                    {sec.name} — {sec.tagline}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    {sec.desc}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                        <span className="text-[0.62rem] font-mono font-semibold text-[#004f9e]">
                          {item.series}
                        </span>
                        <h4 className="mt-1 font-display text-sm font-bold text-graphite">
                          {item.name}
                        </h4>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {item.desc}
                        </p>

                        <div className="mt-auto pt-4 border-t border-border/80">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#004f9e] px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-graphite transition-colors"
                          >
                            <span>View on Amphenol</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
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
            Need Amphenol Components for Your Production Run?
          </h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Contact Qualitech Connectronics for part numbers, availability, volume pricing, and technical datasheets.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate("#contact", true)}
              className="rounded-xl bg-graphite px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
            >
              Enquire for Amphenol Parts →
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
