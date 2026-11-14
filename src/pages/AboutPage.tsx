import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Play,
  Pause,
  ShieldCheck,
  Cpu,
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Check,
} from "lucide-react";

import aboutFactory from "@/assets/qualitech-cable-assembly-manufacturing-facility-hyderabad.jpg";
import facilitiesWide from "@/assets/facilities-wide.jpg";
import cardConnectors from "@/assets/electronic-connectors-amphenol-zolex-qualitech-india.jpg";
import cardCable from "@/assets/custom-cable-assemblies-wire-harnesses-qualitech-india.jpg";
import introVideo from "@/assets/intro_video.mp4";

interface AboutPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.title = "About Qualitech Connectronics | Cable Assembly & Connector Solutions";
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

      {/* ─── 1. Page Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                ABOUT QUALITECH CONNECTRONICS
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              About Qualitech Connectronics – Cable Assembly &amp; Connector Solutions
            </h1>
            <p className="mt-3 font-display text-lg sm:text-xl font-semibold text-brand-yellow">
              Precision Engineering &amp; Electronic Connectivity Since 1995
            </p>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Qualitech Connectronics Private Limited has been delivering electronic connectivity solutions since 1995, supporting OEMs and industrial businesses with custom cable assemblies, wire harnesses and electronic connector distribution. Based in Cherlapally, Hyderabad, we combine manufacturing expertise, electrical testing capabilities and access to established electronic component brands to support application-specific connectivity requirements.
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

      {/* ─── 2. Our Legacy ─── */}
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
                  30+ Years of Cable Assembly &amp; Electronic Connectivity Expertise
                </h2>
                <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                  <p>
                    Established in 1995 by a team of engineering professionals, Qualitech Connectronics has developed expertise in custom cable assembly and wire harness manufacturing alongside electronic connector and component distribution.
                  </p>
                  <p>
                    Over three decades, we have supported OEM requirements across telecommunications, defence, railways, power, automotive, consumer electronics and other industrial applications.
                  </p>
                  <p>
                    Our focus is on delivering application-specific connectivity solutions with attention to manufacturing quality, electrical testing and reliable supply.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={150}>
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                <img
                  src={aboutFactory}
                  alt="Qualitech Connectronics manufacturing facility in Hyderabad, India, for custom cable assemblies and wire harness production"
                  title="Qualitech Manufacturing Facility – Hyderabad, India"
                  loading="lazy"
                  decoding="async"
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

      {/* ─── 3. What Qualitech Does (Our Expertise) ─── */}
      <section className="py-20 lg:py-28 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-orange" />
                <span className="label-eyebrow">Our Expertise</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold leading-tight text-graphite sm:text-4xl">
                Electronic Connector Distribution &amp; Custom Cable Assembly Manufacturing
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                Qualitech supports OEM and industrial connectivity requirements through two core areas: electronic connector and component distribution, and custom cable assembly and wire harness manufacturing.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 01. Electronic Connector Distribution */}
            <Reveal delay={100}>
              <div className="rounded-2xl border border-border bg-white p-7 sm:p-9 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                <div>
                  <div className="overflow-hidden rounded-xl h-48 w-full bg-steel-light/30 mb-6">
                    <img
                      src={cardConnectors}
                      alt="Electronic connectors distributed by Qualitech Connectronics, including Amphenol and Zolex connector solutions"
                      title="Electronic Connectors – Qualitech India"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 font-display text-sm font-bold text-brand-blue">
                      01
                    </span>
                    <h3 className="font-display text-xl font-bold text-graphite">
                      Electronic Connectors &amp; Components
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    We distribute electronic connectors and components from established brands including Amphenol and Zolex for OEM, industrial and application-specific requirements.
                  </p>
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-graphite mb-3">Key Areas:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Electronic Connectors",
                        "Electronic Components",
                        "Amphenol Products",
                        "Zolex Products",
                        "OEM Component Sourcing",
                        "Industrial Connectivity Solutions",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => onNavigate("#products", true)}
                    className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-brand-blue hover:text-graphite transition-colors cursor-pointer"
                  >
                    Explore Electronic Connectors
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Reveal>

            {/* 02. Cable Assembly Manufacturing */}
            <Reveal delay={200}>
              <div className="rounded-2xl border border-border bg-white p-7 sm:p-9 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                <div>
                  <div className="overflow-hidden rounded-xl h-48 w-full bg-steel-light/30 mb-6">
                    <img
                      src={cardCable}
                      alt="Custom cable assemblies and wire harnesses manufactured by Qualitech Connectronics for OEM applications"
                      title="Custom Cable Assemblies & Wire Harnesses – Qualitech India"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-yellow/20 font-display text-sm font-bold text-graphite">
                      02
                    </span>
                    <h3 className="font-display text-xl font-bold text-graphite">
                      Custom Cable Assemblies &amp; Wire Harnesses
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    We manufacture custom cable assemblies and wire harnesses based on application requirements and OEM specifications. Our capabilities include wire processing, cutting, stripping, terminal crimping, assembly, electrical testing and application-specific harness production.
                  </p>
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-graphite mb-3">Key Areas:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Custom Cable Assemblies",
                        "Wire Harness Manufacturing",
                        "OEM Cable Assemblies",
                        "Custom Wire Harnesses",
                        "Automated Wire Processing",
                        "Electrical Testing",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="h-3.5 w-3.5 text-brand-yellow shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => onNavigate("#manufacturing", true)}
                    className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-graphite hover:text-brand-blue transition-colors cursor-pointer"
                  >
                    Explore Manufacturing
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 4. Corporate Film / Facility Tour ─── */}
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
                Inside Qualitech: Cable Assembly Manufacturing in Hyderabad
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-steel max-w-2xl mx-auto">
                Take a closer look at Qualitech's manufacturing operations in Cherlapally, Hyderabad, including wire processing equipment, assembly operations and electrical testing capabilities.
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
                    <span className="text-xs text-steel hidden sm:inline">Full HD Presentation · Cherlapally Facility, Hyderabad</span>
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

      {/* ─── 5. Manufacturing Capabilities ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg">
                <img
                  src={facilitiesWide}
                  alt="Qualitech manufacturing facility in Cherlapally, Hyderabad"
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
                  Custom Cable Assembly Manufacturing Facility in Hyderabad
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Located in Phase-V IDA, Cherlapally, Hyderabad, Qualitech's manufacturing facility supports custom cable assembly and wire harness production for OEM and industrial applications. Our production environment includes dedicated operations for wire cutting, stripping, terminal crimping, assembly and loom braiding, supported by electrical testing and quality inspection processes.
                </p>

                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-graphite mb-3">Key Capabilities:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      "Automated wire cutting and stripping",
                      "Terminal crimping",
                      "Cable and wire harness assembly",
                      "Loom braiding",
                      "Computerized continuity testing",
                      "Insulation resistance testing",
                      "High-voltage hipot testing",
                      "Digital pull-force testing",
                      "ESD-compliant workstations",
                      "Batch serialization and inspection documentation",
                    ].map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-xs text-graphite font-medium">
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
                    Explore Manufacturing Capabilities →
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Quality & Testing ─── */}
      <section className="py-20 lg:py-24 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-yellow" />
                <span className="label-eyebrow">Quality &amp; Testing</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Electrical Testing for Reliable Cable Assemblies
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Qualitech's cable assemblies undergo electrical testing to verify key performance and safety parameters. Testing capabilities include continuity, insulation resistance and high-voltage hipot checks, based on applicable assembly requirements.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Continuity Testing", desc: "100% computerized circuit verification confirming pin-to-pin wiring accuracy." },
              { title: "Insulation Resistance Testing", desc: "High-accuracy measurement ensuring dielectric isolation and barrier integrity." },
              { title: "High-Voltage Hipot Testing", desc: "Dielectric breakdown verification under high potential safety thresholds." },
              { title: "Digital Pull-Force Testing", desc: "Calibrated crimp tensile pull strength verification adhering to standards." },
              { title: "Quality Inspection", desc: "Micrographic crimp cross-section analysis and dimensional verification." },
              { title: "Batch Traceability", desc: "Component lot tracking and serialized quality documentation for every build." },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={idx * 60}>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-xs h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                      ✓
                    </span>
                    <h3 className="font-display text-base font-bold text-graphite">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-brand-blue/5 border border-brand-blue/20 p-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              ★ Application-Specific Testing &amp; Quality Control
            </span>
          </div>
        </div>
      </section>

      {/* ─── 7. Why OEMs Choose Qualitech ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <span className="h-px w-10 bg-brand-yellow inline-block" />
              <div className="mt-3">
                <span className="label-eyebrow">Why Qualitech</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Why OEMs Choose Qualitech for Connectivity Solutions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Qualitech combines more than three decades of industry experience with custom manufacturing, electronic component distribution and electrical testing capabilities to support OEM connectivity requirements.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: "01",
                title: "30+ Years of Experience",
                desc: "Established in 1995, Qualitech brings decades of experience in electronic connectivity and custom cable assembly solutions.",
              },
              {
                num: "02",
                title: "Quality-Focused Manufacturing",
                desc: "Cable assemblies are supported by electrical testing and quality control processes designed around application requirements.",
              },
              {
                num: "03",
                title: "Electronic Component Distribution",
                desc: "Access to established electronic component brands including Amphenol and Zolex supports OEM and industrial sourcing requirements.",
              },
              {
                num: "04",
                title: "End-to-End OEM Support",
                desc: "Qualitech supports requirements from product sourcing and prototype discussions through custom assembly and manufacturing.",
              },
              {
                num: "05",
                title: "Application-Specific Solutions",
                desc: "Cable assemblies and wire harnesses are developed according to individual application and OEM requirements.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-border bg-[#fafbfc] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 font-display text-sm font-bold text-brand-blue">
                    {item.num}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-graphite">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. Industries We Serve ─── */}
      <section className="py-20 lg:py-24 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <span className="h-px w-10 bg-brand-orange inline-block" />
              <div className="mt-3">
                <span className="label-eyebrow">Industries We Serve</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Connectivity Solutions for OEM &amp; Industrial Applications
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Qualitech supports electronic connectivity and cable assembly requirements across diverse industries where reliable component sourcing, custom wiring and application-specific assemblies are required.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {[
              "Electric Vehicles",
              "Automotive",
              "White Goods",
              "Consumer Electronics",
              "Telecommunications",
              "Power & Energy",
              "Defence",
              "Railways",
              "Industrial Automation",
            ].map((ind, idx) => (
              <Reveal key={ind} delay={idx * 40}>
                <div className="rounded-xl border border-border bg-white p-4 text-center shadow-2xs hover:border-brand-blue/40 transition-colors">
                  <span className="font-display text-xs font-bold text-graphite">{ind}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                window.location.hash = "#industries";
                onNavigate("#industries");
              }}
              className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-brand-blue hover:text-graphite transition-colors cursor-pointer"
            >
              Explore Industries <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 9. Location Section ─── */}
      <section className="py-20 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <span className="h-px w-10 bg-brand-orange inline-block" />
              <div className="mt-3">
                <span className="label-eyebrow">Our Location</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Qualitech Connectronics in Hyderabad, Telangana
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Qualitech Connectronics Private Limited operates from Phase-V IDA, Cherlapally, Hyderabad, Telangana. Our manufacturing and business operations support OEM and industrial connectivity requirements across India.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3 bg-[#fafbfc] border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-bold text-graphite mb-1">Works &amp; Office</p>
                  <p>Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Medchal-Malkajgiri, Telangana – 500051, India</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-bold text-graphite mb-1">Direct Phone</p>
                  <a href="tel:+919849001484" className="text-graphite font-bold hover:text-brand-blue">
                    +91 98490 01484
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-yellow shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-bold text-graphite mb-1">Official Email</p>
                  <a href="mailto:info@qualitechindia.in" className="text-brand-blue font-bold hover:underline">
                    info@qualitechindia.in
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="inline-flex items-center gap-2 rounded-xl bg-graphite px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
              >
                Contact Qualitech →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. Final CTA ─── */}
      <section className="py-20 bg-graphite-deep text-white border-b border-border/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
              Looking for a Custom Cable Assembly or Connector Solution?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-steel max-w-2xl mx-auto leading-relaxed">
              Discuss your electronic connector, component sourcing, custom cable assembly or wire harness requirement with Qualitech Connectronics.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="rounded-xl bg-brand-yellow px-8 py-4 font-display text-xs font-bold uppercase tracking-wider text-graphite-deep hover:bg-white transition-all shadow-lg cursor-pointer"
              >
                Request a Quote
              </button>
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
