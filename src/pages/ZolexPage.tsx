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
  const [openSection, setOpenSection] = useState<string>("copper-lugs");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const PRODUCT_SECTIONS = [
    {
      id: "copper-lugs",
      name: "Copper Tube Lugs & Connectors",
      tagline: "High-Conductivity Electrolytic Copper Crimping Lugs & Splices",
      desc: "Manufactured from 99.9% pure ETP copper with uniform electro-tin plating for superior corrosion resistance and low electrical resistance in heavy electrical applications.",
      items: [
        {
          name: "Copper Tube Lugs With Inspection Window",
          series: "Standard Single Hole Series",
          desc: "Precision drawn seamless copper tube lugs with inspection hole to verify full cable insertion prior to crimping.",
          image: p3,
          specs: "1.5 mm² to 1000 mm² · ETP Copper 99.9% · Electro-Tinned",
          url: "https://zolex.in/product/copper-tube-crimping-lugs-one-hole-standard-series-with-inspection-window/",
        },
        {
          name: "Heavy Duty Copper Tube Lugs",
          series: "Heavy Duty Long Barrel Series",
          desc: "Engineered with heavier wall thickness and longer barrels for maximum pull-out strength in vibration-prone industrial motors and transformers.",
          image: p6,
          specs: "Heavy Wall Construction · High Mechanical Strength · 600V - 33kV",
          url: "https://zolex.in/product/copper-tube-crimping-lugs-one-hole-heavy-duty/",
        },
        {
          name: "Two-Hole & Four-Hole Copper Lugs",
          series: "Dual & Multi-Stud Fixation",
          desc: "Two-hole fixing lugs designed to prevent terminal rotation in high-vibration switchboards, busbars, and generator terminations.",
          image: cardConnectors,
          specs: "Anti-Rotation Design · Standard & Custom Stud Hole Centers",
          url: "https://zolex.in/product/copper-tube-crimping-lugs-two-hole/",
        },
        {
          name: "Copper Through Connectors & Reducers",
          series: "Butt Splice & In-Line Links",
          desc: "Solid drawn copper inline ferrules and reducing links for permanent inline jointing of stranded copper cables.",
          image: p4,
          specs: "Internal Wire Stop · Seamless Drawn Tube · High Pull-Off Force",
          url: "https://zolex.in/product/copper-tube-crimping-through-connectors/",
        },
      ],
    },
    {
      id: "crimp-terminals",
      name: "Crimp Terminals",
      tagline: "Insulated, Non-Insulated Ring, Fork, Pin & End Sleeves",
      desc: "High-reliability control wiring terminals made from high-conductivity electrolytic copper with brazed/butted seams and color-coded PVC/nylon insulation.",
      items: [
        {
          name: "Insulated Ring Type Terminals",
          series: "Vinyl & Double Grip Series",
          desc: "Standard and double-grip insulated ring tongue terminals for secure screw stud termination in control panels.",
          image: p2,
          specs: "0.5 mm² - 10 mm² · Color Coded (Red/Blue/Yellow) · UL Standard",
          url: "https://zolex.in/product/insulated-ring-type-terminals/",
        },
        {
          name: "Insulated Fork / Spade Terminals",
          series: "Flanged & Locking Spade Series",
          desc: "Fork terminals allowing rapid installation without completely removing mounting screws in terminal blocks.",
          image: p4,
          specs: "Brazed Seam Barrel · Funnel Entry Insulation · DIN/JIS Compatible",
          url: "https://zolex.in/product/insulated-fork-type-terminals/",
        },
        {
          name: "Insulated Pin Type Terminals",
          series: "Solid Pin & Flat Blade Series",
          desc: "Solid copper round pin and flat blade terminals for inserting stranded wire into compression-type screw terminal strips.",
          image: p3,
          specs: "Electrolytic Copper · Vibration Resistant · Easy Wire Insertion",
          url: "https://zolex.in/product/insulated-pin-type-terminals/",
        },
        {
          name: "Cord End Sleeves (Bootlace Ferrules)",
          series: "Single & Twin Wire End Sleeves",
          desc: "French and German color-coded insulated ferrules preventing wire splaying in spring-clamp and screw-cage terminal blocks.",
          image: p6,
          specs: "0.25 mm² - 50 mm² · Twin Wire Formats · Halogen-Free Polypropylene",
          url: "https://zolex.in/product/insulated-end-sleeve/",
        },
      ],
    },
    {
      id: "aluminium-bimetallic",
      name: "Aluminium & Bimetallic Lugs",
      tagline: "Friction-Welded Bimetallic Lugs & High-Grade Aluminium Connectors",
      desc: "Engineered for terminating aluminium conductors onto copper busbars, eliminating galvanic corrosion through metallurgical friction welding.",
      items: [
        {
          name: "Bimetallic Lugs (Al/Cu Friction Welded)",
          series: "Bi-Metal Palm-to-Barrel Welded",
          desc: "High-conductivity pure copper palm friction-welded to an EC-grade aluminium barrel with neutral barrier joint grease.",
          image: p6,
          specs: "Friction Welded Al/Cu · Anti-Oxidant Greased · 16 mm² to 630 mm²",
          url: "https://zolex.in/product/bimetallic-crimping-lugs-al-cu-2/",
        },
        {
          name: "Aluminium Tube Crimping Lugs",
          series: "1-Hole Standard & Solid Section",
          desc: "Manufactured from pure aluminium tube (99.5% purity) for distribution cables and renewable energy power feeds.",
          image: p3,
          specs: "99.5% Aluminium Purity · Pre-filled Compound Option · DIN Standards",
          url: "https://zolex.in/product/aluminium-tube-crimping-lugs-one-hole/",
        },
        {
          name: "Bimetallic Reducing Links & Connectors",
          series: "Aluminium-to-Copper In-Line Splices",
          desc: "Friction-welded bimetallic transition connectors for joining dissimilar aluminium and copper cables inline.",
          image: p4,
          specs: "Direct Al-to-Cu Jointing · Zero Galvanic Corrosion · High Tensile",
          url: "https://zolex.in/product/bimetallic-crimping-reducing-links-al-cu/",
        },
      ],
    },
    {
      id: "ss-cable-ties",
      name: "Stainless Steel Cable Ties",
      tagline: "Grade 304 & 316 Ball Lock, Ladder & Coated Stainless Steel Ties",
      desc: "Extreme-temperature and flame-proof cable bundling ties engineered for offshore, petrochemical, defense, and harsh outdoor environments.",
      items: [
        {
          name: "Roller Ball Lock SS Cable Ties",
          series: "Pure 304 & 316 Stainless Steel",
          desc: "Self-locking ball mechanism ties providing rapid installation and high loop tensile strength up to 250 lbs.",
          image: cardConnectors,
          specs: "Widths 4.6mm & 7.9mm · Temp -80°C to +538°C · Non-Flammable",
          url: "https://zolex.in/product/roller-ball-lock-type-steel-cable-ties-coated/",
        },
        {
          name: "Polyester Coated SS Cable Ties",
          series: "Fully Coated Marine Grade",
          desc: "Pure 316 SS ties with smooth black polyester coating providing edge protection for fragile cable jackets.",
          image: p2,
          specs: "Black Polyester Coated · High UV & Salt Spray Resistance",
          url: "https://zolex.in/product/roller-ball-lock-type-steel-cable-ties-coated-2/",
        },
        {
          name: "Cable Marker Tags & Carrier Strips",
          series: "SS Embossed Identification Tags",
          desc: "Grade 316 stainless steel cable identification tags and carrier strips for permanent asset marking.",
          image: p4,
          specs: "Chemical & Fire Proof · Custom Lettering / Barcode Carrier",
          url: "https://zolex.in/product/cable-marker-tags-carrier-strips/",
        },
      ],
    },
    {
      id: "cable-glands",
      name: "Cable Glands & Accessories",
      tagline: "Industrial, Weatherproof & Flameproof Brass & Polyamide Cable Glands",
      desc: "Complete ingress sealing and mechanical retention solutions for armoured and unarmoured cables in hazardous and industrial enclosures.",
      items: [
        {
          name: "Double Compression Flameproof Gland",
          series: "Ex d / Ex e Zone 1 & Zone 2",
          desc: "Heavy-duty brass double compression cable gland for armoured cables in hazardous gas/dust industrial environments.",
          image: cardConnectors,
          specs: "Flameproof & Weatherproof · IP66 / IP67 / IP68 · Brass / Nickel Plated",
          url: "https://zolex.in/product/double-compression-flameproof-cable-gland/",
        },
        {
          name: "Single Compression Cable Glands (BW / CW)",
          series: "Industrial Armoured Glands",
          desc: "Standard single compression glands with clamping rings for SWA (steel wire armoured) cables.",
          image: p6,
          specs: "BS 6121 Part 1 · Brass CZ121 · Earth Continuity Verified",
          url: "https://zolex.in/product/bw-industrial-cable-gland/",
        },
        {
          name: "IP68 Polyamide & Brass Glands",
          series: "Metric & PG Cable Glands",
          desc: "High-grade polyamide nylon and nickel-plated brass cable glands with neoprene sealing ring and integrated strain relief.",
          image: p4,
          specs: "IP68 Submersible · Metric M12 - M63 & PG7 - PG48 · Locknut Included",
          url: "https://zolex.in/product/ip68-cable-gland/",
        },
        {
          name: "Gland Accessories (Shrouds, Earth Tags, Reducers)",
          series: "Complete Installation Kit",
          desc: "PVC shrouds, brass lock nuts, nickel-plated earth continuity tags, stop plugs, and thread reducers.",
          image: p3,
          specs: "Corrosion Proof · Flame Retardant PVC Shrouds · Full Thread Sizes",
          url: "https://zolex.in/product/pvc-shroud/",
        },
      ],
    },
    {
      id: "earthing-tools",
      name: "Earthing Accessories & Tools",
      tagline: "Copper Bonded Earth Rods, Clamps & Professional Installation Tools",
      desc: "Comprehensive lightning protection, grounding systems, and precision mechanical tensioning tools for heavy electrical installations.",
      items: [
        {
          name: "Copper Bonded Earth Rods",
          series: "Molecularly Bonded (UL 467)",
          desc: "High-tensile low carbon steel core molecularly bonded with 99.9% pure electrolytic copper for 30+ year grounding lifespan.",
          image: indPower,
          specs: "14.2mm & 17.2mm Dia · Copper Layer 100µm - 254µm · Threaded / Unthreaded",
          url: "https://zolex.in/product/copper-bonded-earth-rod/",
        },
        {
          name: "Rod-to-Cable Clamps & Connectors",
          series: "Type 'G' & Type 'A' Heavy Duty",
          desc: "High-strength naval brass and copper alloy clamps providing high torque connection between earth rod and ground conductors.",
          image: p3,
          specs: "High Clamping Torque · Corrosion Resistant · C-Connectors & U-Bolts",
          url: "https://zolex.in/product/rod-to-cable-clamp-type-g/",
        },
        {
          name: "SS Cable Tie Tensioning & Cutting Gun",
          series: "Automatic Tie Gun Tool",
          desc: "Heavy-duty ergonomic steel tie tensioning gun that automatically cuts flush with adjustable preset tension.",
          image: p2,
          specs: "For SS Ties up to 7.9mm · Auto Flush Cut-Off · Ergonomic Grip",
          url: "https://zolex.in/product/cable-tie-tensioning-cutting-automatic-gun/",
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
                  Copper Crimping Lugs · Terminals · SS Cable Ties · Cable Glands · Earthing
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Qualitech Connectronics is an authorized distribution partner for Zolex (Zeeta Electrical Engineering Pvt. Ltd.) in India. Explore Zolex's comprehensive range of electrical lugs, terminals, cable glands, and ties below with direct access to official product documentation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://zolex.in/product/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-graphite transition-all shadow-md cursor-pointer"
              >
                <span>Visit Zolex Official Portal</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={() => onNavigate("#contact-page", true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <span>Request Zolex Quote →</span>
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
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">99.9% Pure ETP Copper</h4>
              <p className="text-[0.72rem] text-muted-foreground">High conductivity electro-tinned</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              ⚡
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">Immediate Local Stock</h4>
              <p className="text-[0.72rem] text-muted-foreground">Fast dispatch across OEM clients</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              ⚙
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">Harness Integration</h4>
              <p className="text-[0.72rem] text-muted-foreground">Kitting with Qualitech cable looms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold text-lg">
              📋
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-graphite">Tested to Standards</h4>
              <p className="text-[0.72rem] text-muted-foreground">IS / BS / IEC &amp; DIN compliance</p>
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

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {sec.items.map((item) => (
                    <article
                      key={item.name}
                      onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-md cursor-pointer"
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
                        <h4 className="mt-1 font-display text-sm font-bold text-graphite group-hover:text-brand-blue transition-colors">
                          {item.name}
                        </h4>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {item.desc}
                        </p>

                        <div className="mt-3 rounded-lg bg-steel-light/60 px-3 py-1.5 text-[0.65rem] font-mono text-graphite line-clamp-2">
                          {item.specs}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/80 flex flex-col gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-graphite transition-colors cursor-pointer"
                          >
                            <span>View on Zolex</span>
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
            Need Zolex Terminals, Lugs or Cable Glands for Your Production Run?
          </h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Contact Qualitech Connectronics for part numbers, volume pricing, engineering datasheets, and fast local dispatch.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate("#contact-page", true)}
              className="rounded-xl bg-graphite px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
            >
              Enquire for Zolex Parts →
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
