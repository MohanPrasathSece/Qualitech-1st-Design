import { useEffect } from "react";
import { Reveal, Counter } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import aboutFactory from "@/assets/about-factory.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import heroHarness from "@/assets/hero-harness.jpg";

interface AboutPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="about" />

      {/* ─── Page Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                About Qualitech Connectronics
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Precision Engineering &amp; Component Distribution Since 1995
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              For three decades, Qualitech Connectronics Private Limited has been a trusted partner to OEMs across India — delivering high-precision custom cable assemblies and authorized distribution of world-class electronics components.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Company Story & Overview ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-center">
            <div>
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-brand-orange" />
                  <span className="label-eyebrow">Our Legacy</span>
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                  Built on Experience. Driven by Precision.
                </h2>
                <div className="mt-6 space-y-5 text-[0.95rem] leading-relaxed text-muted-foreground">
                  <p>
                    Qualitech was established in 1995 by a team of dedicated engineering professionals. Over the last 30 years, we have grown from a specialized wiring outfit into a premier provider of custom-built wire harnesses and an authorized distributor for leading global electronic component brands including Amphenol and Zolex.
                  </p>
                  <p>
                    Our state-of-the-art facility in Cherlapally, Hyderabad is equipped with modern cutting, stripping, crimping, and computerized electrical test benches. By pairing certified technical manpower with stringent quality control, we ensure 100% defect-free connectivity solutions.
                  </p>
                  <p>
                    Providing high-quality harnesses at competitive prices and timely delivery schedules has always been our core commitment, enabling our OEM clients in telecommunications, defence, railways, and power to stay ahead.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={150}>
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                <img
                  src={aboutFactory}
                  alt="Qualitech manufacturing facility"
                  width={1408}
                  height={1008}
                  className="h-[380px] w-full object-cover sm:h-[480px]"
                />
                <div className="absolute bottom-4 left-4 rounded-xl bg-graphite-deep/90 backdrop-blur-md px-6 py-4 text-white">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-yellow">Established</p>
                  <p className="font-display text-2xl font-bold">1995 · Hyderabad, India</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Core Values & Strengths ─── */}
      <section className="py-20 lg:py-28 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="h-px w-10 bg-brand-yellow inline-block" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Why Industry Leaders Choose Qualitech
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Our pillars of excellence built over three decades of OEM collaboration.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "30+ Years Track Record",
                desc: "Founded in 1995, bringing decades of deep interconnect and cable assembly experience.",
                icon: "30+",
              },
              {
                title: "100% Tested Quality",
                desc: "Every assembly is electrically tested for continuity, insulation resistance and hipot safety.",
                icon: "100%",
              },
              {
                title: "Authorized Distribution",
                desc: "Direct partner access to genuine components from global manufacturers like Amphenol and Zolex.",
                icon: "OEM",
              },
              {
                title: "End-to-End OEM Support",
                desc: "From initial prototype reviews and BOM optimization to high-volume manufacturing.",
                icon: "24/7",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="group h-full rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 font-display text-base font-bold text-brand-blue">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-graphite">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Facilities & Infrastructure ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg">
                <img
                  src={facilitiesWide}
                  alt="Qualitech manufacturing floor"
                  className="h-[360px] sm:h-[440px] w-full object-cover"
                />
              </div>
            </Reveal>

            <div>
              <Reveal delay={120}>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-brand-orange" />
                  <span className="label-eyebrow">Manufacturing Facility</span>
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold text-graphite sm:text-4xl">
                  Modern Production Floor in Cherlapally
                </h2>
                <div className="mt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Located in the prime industrial zone of Phase-V IDA, Cherlapally, Hyderabad, our plant is outfitted with dedicated assembly lines for harness cutting, stripping, terminal crimping, and loom braiding.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {[
                      "Automated wire processing & digital pull-force testing",
                      "Multi-point computerized harness continuity test systems",
                      "Anti-static workstations compliant with ESD standards",
                      "Traceable batch serialization and inspection documentation",
                    ].map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-graphite font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => onNavigate("#manufacturing", true)}
                    className="rounded-xl bg-graphite px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
                  >
                    Explore Manufacturing →
                  </button>
                  <button
                    onClick={() => onNavigate("#contact", true)}
                    className="rounded-xl border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                  >
                    Contact Us
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
