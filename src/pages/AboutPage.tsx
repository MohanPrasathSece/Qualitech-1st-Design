import { useEffect, useRef, useState } from "react";
import { Reveal, Counter } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Play, Pause, ShieldCheck, Cpu, Building2, CheckCircle2 } from "lucide-react";

import aboutFactory from "@/assets/about-factory.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import heroHarness from "@/assets/hero-harness.jpg";
import introVideo from "@/assets/intro_video.mp4";

interface AboutPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScrollToVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById("corporate-video");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 700);
    }
  };

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
              Precision Engineering &amp; Connector Distribution Since 1995
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              For three decades, Qualitech Connectronics Private Limited has been a trusted partner to OEMs across India - delivering high-precision custom cable assemblies and authorized distribution of world-class electronics components.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={handleScrollToVideo}
                className="inline-flex items-center gap-2.5 rounded-xl bg-brand-yellow px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-graphite-deep hover:bg-white transition-all shadow-lg hover:shadow-brand-yellow/20 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Watch Corporate Film
              </button>
              <button
                onClick={() => onNavigate("#manufacturing", true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Explore Manufacturing →
              </button>
            </div>
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

      {/* ─── Corporate Video Showcase ─── */}
      <section id="corporate-video" className="py-20 lg:py-28 bg-graphite-deep text-white border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-brand-yellow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />
                Corporate Film &amp; Facility Tour
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Inside Qualitech: Precision in Motion
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-steel max-w-2xl mx-auto">
                Discover our advanced wire processing equipment, automated test benches, and dedicated assembly lines at our Cherlapally manufacturing plant in Hyderabad.
              </p>
            </div>
          </Reveal>

          {/* Video Player Frame */}
          <Reveal delay={150}>
            <div className="mt-12 max-w-5xl mx-auto">
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-black/60 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden group">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    ref={videoRef}
                    src={introVideo}
                    poster={facilitiesWide}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Custom Play Backdrop Overlay (Visible when not actively playing) */}
                  {!isPlaying && (
                    <div
                      onClick={handlePlayVideo}
                      className="absolute inset-0 bg-gradient-to-t from-graphite-deep/90 via-graphite-deep/40 to-transparent flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:backdrop-blur-[1px] group/overlay"
                    >
                      <div className="relative">
                        <div className="absolute -inset-3 rounded-full bg-brand-yellow/20 animate-ping opacity-75" />
                        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-brand-yellow text-graphite-deep shadow-2xl transition-transform duration-300 group-hover/overlay:scale-110">
                          <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1 fill-current" />
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="font-display text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-md">
                          Click to Play Corporate Film
                        </p>
                        <p className="mt-1 text-xs text-steel">
                          Full HD Presentation · Cherlapally Facility, Hyderabad
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info Sub-bar */}
                <div className="border-t border-white/10 bg-graphite-deep/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Qualitech Connectronics Pvt Ltd
                    </span>
                    <span className="text-xs text-steel hidden sm:inline">|</span>
                    <span className="text-xs text-steel hidden sm:inline">Official Introduction Video</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayVideo}
                      className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" /> Play Video
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Key Facility Highlights Bar */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Automated Processing",
                desc: "High-speed wire cutting, stripping & calibrated crimping",
                icon: Cpu,
              },
              {
                title: "100% Quality Tested",
                desc: "Continuity, insulation resistance & high-voltage hipot checks",
                icon: ShieldCheck,
              },
              {
                title: "Cherlapally Plant",
                desc: "Phase-V IDA industrial facility in Hyderabad, Telangana",
                icon: Building2,
              },
              {
                title: "Authorized Partner",
                desc: "Direct distribution for Amphenol & Zolex components",
                icon: CheckCircle2,
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-brand-yellow/40 hover:bg-white/[0.06]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white">{feature.title}</h4>
                    <p className="mt-1.5 text-[0.78rem] leading-relaxed text-steel">{feature.desc}</p>
                  </div>
                </Reveal>
              );
            })}
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
                    onClick={() => onNavigate("#contact-page", true)}
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
