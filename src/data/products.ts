import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import cardCable from "@/assets/card-cable-assemblies.jpg";
import cardConnectors from "@/assets/card-connectors.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import heroHarness from "@/assets/hero-harness.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";
import indPower from "@/assets/ind-power.jpg";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: "Electronics Components" | "Cable Assemblies";
  subCategory: string;
  brand: "Amphenol" | "Zolex" | "Qualitech";
  description: string;
  features: string[];
  specs: Record<string, string>;
  industries: string[];
  featured?: boolean;
  image: string;
  inStock: boolean;
  /** External URL — clicking this product redirects here */
  externalUrl?: string;
  /** If true, "Enquire Now" instead of "View Product" */
  isEnquiry?: boolean;
}

export const CATEGORIES = [
  "All Products",
  "Electronics Components",
  "Cable Assemblies",
] as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  "Electronics Components": [
    "Amphenol — Connectors",
    "Amphenol — Antennas",
    "Amphenol — RF & Coaxial",
    "Amphenol — Fiber Optic",
    "Zolex — Copper Lugs & Links",
    "Zolex — Crimp Terminals",
    "Zolex — Aluminium & Bimetallic",
    "Zolex — SS Cable Ties",
    "Zolex — Cable Glands",
    "Zolex — Earthing Accessories",
  ],
  "Cable Assemblies": [
    "Custom Wire Harnesses",
    "Ribbon Cable Assemblies",
    "RF Cable Assemblies",
    "Power Cable Assemblies",
    "Defense Cable Assemblies",
  ],
};

export const ALL_INDUSTRIES = [
  "Telecommunications",
  "Power & Energy",
  "Defense",
  "Railways",
  "Industrial Automation",
  "Automotive",
  "EV Charging",
  "Consumer Electronics",
];

export const BRANDS = ["All Brands", "Amphenol", "Zolex", "Qualitech"] as const;

export const PRODUCTS: Product[] = [
  // ═══════════════════════════════════════════
  // AMPHENOL — Connectors
  // ═══════════════════════════════════════════
  {
    id: "amp-circular-mil",
    sku: "AMPHENOL-CIRC-MIL",
    name: "Circular MIL-Spec Connectors",
    category: "Electronics Components",
    subCategory: "Amphenol — Connectors",
    brand: "Amphenol",
    description: "Amphenol circular MIL-spec connectors for defence, aerospace, and harsh environment applications. View full product range on Amphenol's official website.",
    features: [
      "MIL-DTL-38999 and MIL-DTL-26482 series",
      "Harsh environment rated",
      "Multiple shell sizes and contact arrangements",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Circular MIL-Spec",
      Application: "Defence, Aerospace",
    },
    industries: ["Defense", "Telecommunications", "Railways"],
    featured: true,
    image: p1,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/sheerpwr-circular.html",
  },
  {
    id: "amp-industrial-circ",
    sku: "AMPHENOL-IND-CIRC",
    name: "Industrial Circular Connectors",
    category: "Electronics Components",
    subCategory: "Amphenol — Connectors",
    brand: "Amphenol",
    description: "Amphenol industrial circular connectors — robust, reliable connectivity for factory automation, industrial control and power distribution.",
    features: [
      "IP67/IP68 rated options",
      "Multiple pin configurations",
      "Screw, bayonet and push-pull locking",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Industrial Circular",
      Application: "Industrial Automation, Power",
    },
    industries: ["Industrial Automation", "Power & Energy", "EV Charging"],
    featured: true,
    image: p3,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/single-pair-ethernet-ip67.html",
  },
  {
    id: "amp-dsub-connectors",
    sku: "AMPHENOL-DSUB",
    name: "D-Sub Connectors",
    category: "Electronics Components",
    subCategory: "Amphenol — Connectors",
    brand: "Amphenol",
    description: "Amphenol D-subminiature connectors for data, signal and mixed-layout applications. Available in standard, high-density and filtered configurations.",
    features: [
      "Standard and high-density pin configurations",
      "Solder cup, crimp and PCB mount options",
      "EMI filtered variants available",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "D-Subminiature",
      Application: "Data Communications, Instrumentation",
    },
    industries: ["Telecommunications", "Industrial Automation", "Defense"],
    featured: false,
    image: p2,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/connectors/d-sub.html",
  },
  {
    id: "amp-pcb-connectors",
    sku: "AMPHENOL-PCB",
    name: "PCB Connectors & Headers",
    category: "Electronics Components",
    subCategory: "Amphenol — Connectors",
    brand: "Amphenol",
    description: "Amphenol board-to-board, wire-to-board and PCB header connectors for high-speed data, power and mixed-signal applications.",
    features: [
      "Board-to-board and wire-to-board",
      "High-speed differential pairs",
      "Multiple pitch options",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "PCB Connectors",
      Application: "Electronics, High-Speed Data",
    },
    industries: ["Consumer Electronics", "Telecommunications", "Industrial Automation"],
    featured: false,
    image: p6,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/paladin.html",
  },

  // ═══════════════════════════════════════════
  // AMPHENOL — Antennas
  // ═══════════════════════════════════════════
  {
    id: "amp-gnss-antenna",
    sku: "AMPHENOL-GNSS-ANT",
    name: "GNSS Antennas",
    category: "Electronics Components",
    subCategory: "Amphenol — Antennas",
    brand: "Amphenol",
    description: "Amphenol high-precision GNSS antennas for GPS, GLONASS, Galileo and BeiDou navigation and timing applications.",
    features: [
      "Multi-band GNSS support",
      "High-gain integrated LNA",
      "IP67 weatherproof options",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "GNSS Antenna",
      Application: "Navigation, Timing, Fleet Management",
    },
    industries: ["Telecommunications", "Railways", "Automotive", "Defense"],
    featured: true,
    image: p1,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/gnss.html",
  },
  {
    id: "amp-cellular-antenna",
    sku: "AMPHENOL-CELL-ANT",
    name: "4G/5G Cellular Antennas",
    category: "Electronics Components",
    subCategory: "Amphenol — Antennas",
    brand: "Amphenol",
    description: "Amphenol 4G LTE and 5G wideband cellular antennas for IoT gateways, routers, telematics and industrial communication systems.",
    features: [
      "Wideband 600 MHz to 6 GHz coverage",
      "Low-profile puck and panel styles",
      "Outdoor and indoor variants",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Cellular Antenna",
      Application: "IoT, Telematics, Industrial",
    },
    industries: ["Telecommunications", "EV Charging", "Industrial Automation"],
    featured: true,
    image: p2,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/cellular.html",
  },
  {
    id: "amp-wifi-antenna",
    sku: "AMPHENOL-WIFI-ANT",
    name: "Wi-Fi & Bluetooth Dipoles",
    category: "Electronics Components",
    subCategory: "Amphenol — Antennas",
    brand: "Amphenol",
    description: "Amphenol dual-band Wi-Fi and Bluetooth antennas — articulated rubber duck and terminal antennas for industrial gateways and wireless APs.",
    features: [
      "2.4 GHz and 5.8 GHz dual-band",
      "High gain articulated dipole",
      "SMA / RP-SMA connector options",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Wi-Fi / Bluetooth Antenna",
      Application: "Wireless APs, Routers, Industrial IoT",
    },
    industries: ["Consumer Electronics", "Industrial Automation", "Telecommunications"],
    featured: false,
    image: p3,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/wi-fi-bluetooth.html",
  },
  {
    id: "amp-fpc-antenna",
    sku: "AMPHENOL-FPC-ANT",
    name: "Internal Embedded FPC Antennas",
    category: "Electronics Components",
    subCategory: "Amphenol — Antennas",
    brand: "Amphenol",
    description: "Ultra-thin flexible peel-and-stick FPC antennas with IPEX micro coaxial leads for compact IoT, smart meters, and tracking devices.",
    features: [
      "NB-IoT / LoRa / LTE-M / Embedded frequencies",
      "Peel-and-stick 3M adhesive backing",
      "IPEX / U.FL micro-coaxial connectors",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Embedded FPC Antenna",
      Application: "Wearables, Smart Meters, Compact IoT",
    },
    industries: ["Consumer Electronics", "Industrial Automation", "Telecommunications"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/embedded-antenna.html",
  },

  // ═══════════════════════════════════════════
  // AMPHENOL — RF & Coaxial
  // ═══════════════════════════════════════════
  {
    id: "amp-rf-connectors",
    sku: "AMPHENOL-RF-CONN",
    name: "RF & Coaxial Connectors",
    category: "Electronics Components",
    subCategory: "Amphenol — RF & Coaxial",
    brand: "Amphenol",
    description: "Amphenol RF connectors — SMA, BNC, N-Type, TNC and specialty coaxial connectors for high-frequency signal integrity.",
    features: [
      "SMA, BNC, N-Type, TNC series",
      "50Ω and 75Ω impedance options",
      "High frequency performance",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "RF Coaxial Connectors",
      Application: "RF Systems, Test & Measurement",
    },
    industries: ["Telecommunications", "Defense", "Automotive"],
    featured: true,
    image: p4,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/filter-rf-bnc.html",
  },
  {
    id: "amp-rf-cables",
    sku: "AMPHENOL-RF-CABLE",
    name: "RF Cable Assemblies",
    category: "Electronics Components",
    subCategory: "Amphenol — RF & Coaxial",
    brand: "Amphenol",
    description: "Amphenol precision RF cable assemblies with tested VSWR performance for telecom infrastructure, test labs and defence systems.",
    features: [
      "Low-loss and ultra-flexible options",
      "Custom lengths available",
      "Factory tested to tight VSWR specs",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "RF Cable Assembly",
      Application: "Telecom, Defence, Test & Measurement",
    },
    industries: ["Telecommunications", "Defense"],
    featured: false,
    image: p5,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/catalogsearch/result?query=coaxial",
  },

  // ═══════════════════════════════════════════
  // AMPHENOL — Fiber Optic
  // ═══════════════════════════════════════════
  {
    id: "amp-fiber-connectors",
    sku: "AMPHENOL-FO-CONN",
    name: "Fiber Optic Connectors & Patch Cords",
    category: "Electronics Components",
    subCategory: "Amphenol — Fiber Optic",
    brand: "Amphenol",
    description: "Amphenol fiber optic connectors, adapters and patch cords for high-bandwidth data center and telecom backhaul networks.",
    features: [
      "LC, SC, ST, MTP/MPO connector types",
      "Single-mode and multi-mode",
      "Low insertion loss",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Fiber Optic",
      Application: "Data Centers, Telecom",
    },
    industries: ["Telecommunications", "Power & Energy"],
    featured: false,
    image: indTelecom,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/fiber-optics.html",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — Copper Lugs & Links
  // ═══════════════════════════════════════════
  {
    id: "zolex-copper-lugs-1",
    sku: "ZOLEX-LUG-CU-01",
    name: "Copper Tube Crimping Lugs (Inspection Window)",
    category: "Electronics Components",
    subCategory: "Zolex — Copper Lugs & Links",
    brand: "Zolex",
    description: "Zolex standard series single-hole copper tube crimping lugs with inspection window, manufactured from 99.9% pure ETP copper with electro-tin plating.",
    features: [
      "99.9% pure electrolytic high-conductivity copper",
      "Inspection window to verify cable insertion depth",
      "Uniform electro-tin plated for corrosion protection",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Copper Tube Crimping Lugs",
      Material: "ETP Copper 99.9%",
      Range: "1.5 mm² to 1000 mm²",
    },
    industries: ["Power & Energy", "Industrial Automation", "Railways", "EV Charging"],
    featured: true,
    image: p3,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-tube-crimping-lugs-one-hole-standard-series-with-inspection-window/",
  },
  {
    id: "zolex-lugs-heavyduty",
    sku: "ZOLEX-LUG-CU-HD",
    name: "Heavy Duty Copper Tube Lugs",
    category: "Electronics Components",
    subCategory: "Zolex — Copper Lugs & Links",
    brand: "Zolex",
    description: "Engineered with heavier wall thickness and longer barrels for maximum pull-out strength in vibration-prone industrial motors, generators and transformers.",
    features: [
      "Heavy wall construction for high current density",
      "Extended barrel length for secure double crimp",
      "Rated from 600V up to 33kV",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Heavy Duty Copper Lugs",
      Material: "Electrolytic High Conductivity Copper",
      Rating: "600V to 33kV",
    },
    industries: ["Power & Energy", "Railways", "Industrial Automation"],
    featured: false,
    image: p6,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-tube-crimping-lugs-one-hole-heavy-duty/",
  },
  {
    id: "zolex-lugs-two-hole",
    sku: "ZOLEX-LUG-CU-2H",
    name: "Two-Hole & Multi-Stud Copper Lugs",
    category: "Electronics Components",
    subCategory: "Zolex — Copper Lugs & Links",
    brand: "Zolex",
    description: "Anti-rotation dual and multi-stud fixing lugs designed to prevent terminal loosening in high-vibration switchboards, busbars, and generator terminations.",
    features: [
      "Dual stud fixing prevents terminal twist and loosening",
      "Standard and custom stud center spacing",
      "Electro-tin plated for long-term corrosion resistance",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Two-Hole Copper Lugs",
      Material: "ETP Copper 99.9%",
      Mounting: "Dual Stud Anti-Rotation",
    },
    industries: ["Power & Energy", "Industrial Automation", "Telecommunications"],
    featured: false,
    image: cardConnectors,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-tube-crimping-lugs-two-hole/",
  },
  {
    id: "zolex-through-connectors",
    sku: "ZOLEX-LINK-CU-BUTT",
    name: "Copper Through Connectors & Reducers",
    category: "Electronics Components",
    subCategory: "Zolex — Copper Lugs & Links",
    brand: "Zolex",
    description: "Solid drawn copper inline ferrules and reducing links for permanent, low-resistance inline butt-splicing of stranded copper cables.",
    features: [
      "Internal wire stop ensures equal conductor insertion",
      "Seamless drawn tube for maximum mechanical tensile strength",
      "Standard and reducing sizes available",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Copper Butt Splice Links",
      Material: "Electrolytic Pure Copper",
      Feature: "Center Wire Stop",
    },
    industries: ["Power & Energy", "Railways", "Telecommunications"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-tube-crimping-through-connectors/",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — Crimp Terminals
  // ═══════════════════════════════════════════
  {
    id: "zolex-terminals-ring",
    sku: "ZOLEX-TERM-RING",
    name: "Insulated Ring Tongue Terminals",
    category: "Electronics Components",
    subCategory: "Zolex — Crimp Terminals",
    brand: "Zolex",
    description: "Zolex color-coded vinyl and nylon insulated ring crimp terminals for high-vibration control panel and switchgear wiring.",
    features: [
      "Brazed seam barrel prevents splitting under crimping",
      "Funnel wire entry for swift conductor insertion",
      "Color-coded (Red, Blue, Yellow) per wire gauge",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Insulated Ring Terminals",
      Material: "Electrolytic Copper + Vinyl Insulation",
      Range: "0.5 mm² to 10 mm²",
    },
    industries: ["Industrial Automation", "Telecommunications", "Consumer Electronics"],
    featured: true,
    image: p2,
    inStock: true,
    externalUrl: "https://zolex.in/product/insulated-ring-type-terminals/",
  },
  {
    id: "zolex-terminals-fork",
    sku: "ZOLEX-TERM-FORK",
    name: "Insulated Fork / Spade Terminals",
    category: "Electronics Components",
    subCategory: "Zolex — Crimp Terminals",
    brand: "Zolex",
    description: "Flanged and locking spade terminals allowing rapid disconnection and connection without completely removing mounting screws in terminal blocks.",
    features: [
      "Rapid slide-in installation under screw heads",
      "Brazed seam barrel with funnel entry insulation",
      "DIN and JIS compatible mounting formats",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Insulated Fork Terminals",
      Material: "Copper + Flame Retardant PVC",
      Range: "0.5 mm² to 6 mm²",
    },
    industries: ["Industrial Automation", "Consumer Electronics"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://zolex.in/product/insulated-fork-type-terminals/",
  },
  {
    id: "zolex-terminals-pin",
    sku: "ZOLEX-TERM-PIN",
    name: "Insulated Pin & Blade Terminals",
    category: "Electronics Components",
    subCategory: "Zolex — Crimp Terminals",
    brand: "Zolex",
    description: "Solid copper round pin and flat blade terminals for inserting stranded wire directly into European-style compression terminal blocks.",
    features: [
      "Solid round pin and flat blade configurations",
      "Prevents conductor strand damage during screw clamping",
      "Vibration-resistant crimped retention",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Insulated Pin Terminals",
      Material: "Electrolytic Copper + Insulation",
      Range: "0.5 mm² to 10 mm²",
    },
    industries: ["Industrial Automation", "Power & Energy"],
    featured: false,
    image: p3,
    inStock: true,
    externalUrl: "https://zolex.in/product/insulated-pin-type-terminals/",
  },
  {
    id: "zolex-bootlace-ferrules",
    sku: "ZOLEX-FERRULE-SLEEVE",
    name: "Cord End Sleeves (Bootlace Ferrules)",
    category: "Electronics Components",
    subCategory: "Zolex — Crimp Terminals",
    brand: "Zolex",
    description: "French and German DIN color-coded insulated single and twin-wire ferrules preventing wire splaying in spring-clamp and screw-cage terminal blocks.",
    features: [
      "Single wire and twin wire entry formats",
      "Halogen-free polypropylene insulation collar",
      "Tinned electrolytic copper sleeve",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Cord End Sleeves",
      Material: "Tinned Copper + Polypropylene",
      Range: "0.25 mm² to 50 mm²",
    },
    industries: ["Industrial Automation", "Power & Energy", "Consumer Electronics"],
    featured: false,
    image: p6,
    inStock: true,
    externalUrl: "https://zolex.in/product/insulated-end-sleeve/",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — Aluminium & Bimetallic
  // ═══════════════════════════════════════════
  {
    id: "zolex-bimetallic-lugs",
    sku: "ZOLEX-LUG-BIMETAL",
    name: "Bimetallic Lugs (Al/Cu Friction Welded)",
    category: "Electronics Components",
    subCategory: "Zolex — Aluminium & Bimetallic",
    brand: "Zolex",
    description: "High-conductivity pure copper palm friction-welded to an EC-grade aluminium barrel with neutral barrier joint grease to eliminate galvanic corrosion.",
    features: [
      "Metallurgical friction welding for zero galvanic corrosion",
      "Factory pre-filled with neutral anti-oxidant grease",
      "Capped barrel ends to protect contact compound",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Bimetallic Al/Cu Lugs",
      Material: "Copper Palm + EC Aluminium Barrel",
      Range: "16 mm² to 630 mm²",
    },
    industries: ["Power & Energy", "Railways", "EV Charging"],
    featured: true,
    image: p6,
    inStock: true,
    externalUrl: "https://zolex.in/product/bimetallic-crimping-lugs-al-cu-2/",
  },
  {
    id: "zolex-aluminium-lugs",
    sku: "ZOLEX-LUG-AL-01",
    name: "Aluminium Tube Crimping Lugs",
    category: "Electronics Components",
    subCategory: "Zolex — Aluminium & Bimetallic",
    brand: "Zolex",
    description: "Manufactured from pure aluminium tube (99.5% purity) for distribution cables and renewable energy power feeds.",
    features: [
      "99.5% high-purity aluminium",
      "Pre-filled with contact compound option",
      "Conforms to IS and DIN standards",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Aluminium Crimping Lugs",
      Material: "EC Grade Aluminium 99.5%",
      Range: "10 mm² to 1000 mm²",
    },
    industries: ["Power & Energy", "Railways"],
    featured: false,
    image: p3,
    inStock: true,
    externalUrl: "https://zolex.in/product/aluminium-tube-crimping-lugs-one-hole/",
  },
  {
    id: "zolex-bimetal-links",
    sku: "ZOLEX-LINK-BIMETAL",
    name: "Bimetallic Reducing Links & Connectors",
    category: "Electronics Components",
    subCategory: "Zolex — Aluminium & Bimetallic",
    brand: "Zolex",
    description: "Friction-welded bimetallic transition connectors for direct inline butt-jointing of dissimilar aluminium and copper conductors.",
    features: [
      "Direct Al-to-Cu jointing with zero galvanic reaction",
      "Internal barrier ensures separate conductor seating",
      "Pre-greased aluminium barrel with plastic end seal",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Bimetallic Butt Links",
      Material: "Copper & Aluminium Friction Welded",
      Application: "Dissimilar Cable Transition",
    },
    industries: ["Power & Energy", "Industrial Automation"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://zolex.in/product/bimetallic-crimping-reducing-links-al-cu/",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — SS Cable Ties
  // ═══════════════════════════════════════════
  {
    id: "zolex-ss-cable-ties",
    sku: "ZOLEX-TIE-SS316",
    name: "Roller Ball Lock Stainless Steel Cable Ties",
    category: "Electronics Components",
    subCategory: "Zolex — SS Cable Ties",
    brand: "Zolex",
    description: "Grade 304 and 316 stainless steel roller ball self-locking cable ties, uncoated, for extreme temperature, harsh outdoor, marine, and defense environments.",
    features: [
      "Self-locking internal ball mechanism",
      "Extreme temperature resistance (-80°C to +538°C)",
      "High tensile loop strength up to 250 lbs",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Stainless Steel Cable Ties",
      Material: "AISI 304 / 316 Stainless Steel",
      Widths: "4.6mm & 7.9mm",
    },
    industries: ["Defense", "Power & Energy", "Telecommunications", "Railways"],
    featured: false,
    image: cardConnectors,
    inStock: true,
    externalUrl: "https://zolex.in/product/roller-ball-lock-type-steel-cable-ties-coated/",
  },
  {
    id: "zolex-ss-coated-ties",
    sku: "ZOLEX-TIE-SS-COAT",
    name: "Polyester Coated SS Cable Ties",
    category: "Electronics Components",
    subCategory: "Zolex — SS Cable Ties",
    brand: "Zolex",
    description: "Pure 316 SS ties with smooth black polyester coating providing edge protection for fragile cable jackets, marine rigs, and offshore solar farms.",
    features: [
      "Black polyester coating prevents cable sheath abrasion",
      "Superior salt spray and UV corrosion resistance",
      "Halogen-free and flame retardant coating",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Coated SS Cable Ties",
      Material: "316 Stainless Steel + Polyester Coating",
      Widths: "4.6mm & 7.9mm",
    },
    industries: ["Defense", "Power & Energy", "Telecommunications"],
    featured: false,
    image: p2,
    inStock: true,
    externalUrl: "https://zolex.in/product/roller-ball-lock-type-steel-cable-ties-coated-2/",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — Cable Glands
  // ═══════════════════════════════════════════
  {
    id: "zolex-cable-glands",
    sku: "ZOLEX-GLAND-FLAME",
    name: "Double Compression Flameproof Cable Glands",
    category: "Electronics Components",
    subCategory: "Zolex — Cable Glands",
    brand: "Zolex",
    description: "Zolex heavy-duty brass double compression flameproof (Ex d / Ex e) cable glands for armoured cables in hazardous industrial environments.",
    features: [
      "Ex d / Ex e Zone 1 & Zone 2 certified",
      "IP66 / IP67 / IP68 submersible ingress sealing",
      "Earth continuity and mechanical cable retention",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Flameproof Cable Glands",
      Material: "Brass / Nickel Plated Brass",
      Threads: "Metric & NPT",
    },
    industries: ["Power & Energy", "Industrial Automation", "Defense"],
    featured: false,
    image: cardConnectors,
    inStock: true,
    externalUrl: "https://zolex.in/product/double-compression-flameproof-cable-gland/",
  },
  {
    id: "zolex-single-glands",
    sku: "ZOLEX-GLAND-BW",
    name: "Single Compression Cable Glands (BW / CW)",
    category: "Electronics Components",
    subCategory: "Zolex — Cable Glands",
    brand: "Zolex",
    description: "Standard single compression glands with clamping rings for SWA (steel wire armoured) cables in dry indoor and weatherproof outdoor environments.",
    features: [
      "BS 6121 Part 1 certified manufacturing",
      "Solid brass CZ121 construction",
      "Earth continuity cone and clamping ring",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Single Compression Glands",
      Material: "Brass CZ121 / Nickel Plated",
      Standard: "BS 6121 Part 1",
    },
    industries: ["Power & Energy", "Industrial Automation"],
    featured: false,
    image: p6,
    inStock: true,
    externalUrl: "https://zolex.in/product/bw-industrial-cable-gland/",
  },
  {
    id: "zolex-ip68-glands",
    sku: "ZOLEX-GLAND-IP68",
    name: "IP68 Polyamide & Brass Glands",
    category: "Electronics Components",
    subCategory: "Zolex — Cable Glands",
    brand: "Zolex",
    description: "High-grade polyamide nylon and nickel-plated brass cable glands with neoprene sealing ring and integrated strain relief for control panels and solar inverters.",
    features: [
      "IP68 submersible waterproof rating",
      "Integrated strain relief claw",
      "Complete with locknut and washer",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Nylon & Brass IP68 Glands",
      Material: "Polyamide PA66 / Nickel Plated Brass",
      Threads: "Metric M12-M63 & PG7-PG48",
    },
    industries: ["Industrial Automation", "EV Charging", "Power & Energy"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://zolex.in/product/ip68-cable-gland/",
  },

  // ═══════════════════════════════════════════
  // ZOLEX — Earthing Accessories
  // ═══════════════════════════════════════════
  {
    id: "zolex-earth-rods",
    sku: "ZOLEX-EARTH-ROD",
    name: "Copper Bonded Earth Rods & Accessories",
    category: "Electronics Components",
    subCategory: "Zolex — Earthing Accessories",
    brand: "Zolex",
    description: "Molecularly copper bonded steel core earth grounding rods and heavy-duty clamps for sub-station, power generation, and industrial lightning protection.",
    features: [
      "99.9% electrolytic copper molecularly bonded to steel core",
      "UL 467 compliance with 254µm copper coating thickness",
      "Corrosion-resistant heavy-duty rod-to-cable clamps",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Grounding Earth Rods",
      Material: "High-Tensile Steel + Electrolytic Copper",
      Standards: "UL 467 / IEEE 80",
    },
    industries: ["Power & Energy", "Telecommunications", "Railways"],
    featured: false,
    image: indPower,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-bonded-earth-rod/",
  },
  {
    id: "zolex-earth-clamps",
    sku: "ZOLEX-EARTH-CLAMP",
    name: "Rod-to-Cable Clamps & Ground Connectors",
    category: "Electronics Components",
    subCategory: "Zolex — Earthing Accessories",
    brand: "Zolex",
    description: "High-strength naval brass and copper alloy Type G and Type A clamps providing high torque connection between earth rod and ground conductors.",
    features: [
      "High clamping torque without conductor damage",
      "Naval brass and high copper alloy casting",
      "U-bolt and C-connector variations available",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Earth Clamps",
      Material: "Naval Brass / Gunmetal",
      Fit: "Rod 14.2mm - 20mm",
    },
    industries: ["Power & Energy", "Telecommunications", "Railways"],
    featured: false,
    image: p3,
    inStock: true,
    externalUrl: "https://zolex.in/product/rod-to-cable-clamp-type-g/",
  },

  // ═══════════════════════════════════════════
  // CABLE ASSEMBLIES — Qualitech Manufacturing
  // ═══════════════════════════════════════════
  {
    id: "qt-harness-custom",
    sku: "QT-HARN-OEM-01",
    name: "Multi-Branch Custom Wire Harness Assembly",
    category: "Cable Assemblies",
    subCategory: "Custom Wire Harnesses",
    brand: "Qualitech",
    description: "Precision point-to-point engineered wire harness with multiple branches, braided nylon sleeving, heat-shrink strain relief and 100% automated continuity testing.",
    features: [
      "Custom routing and branch breakouts for exact OEM chassis fit",
      "Automated cut, strip, crimp and digital pull-force testing",
      "Custom laser-printed heat-shrink wire identification sleeves",
    ],
    specs: {
      Voltage: "Up to 600V",
      Current: "Engineered per circuit (1A to 40A)",
      "Temp Range": "-40°C to +125°C",
      Compliance: "IPC/WHMA-A-620 Class 3, ISO 9001",
    },
    industries: ["Defense", "Railways", "Telecommunications", "EV Charging"],
    featured: true,
    image: heroHarness,
    inStock: true,
    isEnquiry: true,
  },
  {
    id: "qt-ribbon-frc",
    sku: "QT-CA-FRC-26",
    name: "Shielded Flat Ribbon Cable Assembly",
    category: "Cable Assemblies",
    subCategory: "Ribbon Cable Assemblies",
    brand: "Qualitech",
    description: "Custom length flat ribbon cable terminated with IDC sockets, aluminum foil shielding, and drain wire for noise-immune high-speed internal bus links.",
    features: [
      "High flexibility stranded tinned copper conductors",
      "Optional aluminum Mylar foil wrap with PVC outer sleeve",
      "100% pin-out verified",
    ],
    specs: {
      Conductors: "Multiple configurations available",
      Voltage: "300V RMS",
      "Temp Range": "-20°C to +105°C",
      Compliance: "UL2651, RoHS",
    },
    industries: ["Telecommunications", "Industrial Automation", "Consumer Electronics"],
    featured: false,
    image: cardCable,
    inStock: true,
    isEnquiry: true,
  },
  {
    id: "qt-rf-cable",
    sku: "QT-RF-CABLE-01",
    name: "Low-Loss Coaxial RF Cable Assembly",
    category: "Cable Assemblies",
    subCategory: "RF Cable Assemblies",
    brand: "Qualitech",
    description: "Precision 50-ohm RF coaxial cable assemblies with tested VSWR performance, custom lengths and connector configurations.",
    features: [
      "Multiple connector options (SMA, BNC, N-Type, TNC)",
      "Low-loss and ultra-flexible cable types",
      "Factory tested to tight VSWR specifications",
    ],
    specs: {
      Impedance: "50 Ohm",
      "Temp Range": "-55°C to +200°C",
      Compliance: "MIL-C-17, RoHS",
    },
    industries: ["Telecommunications", "Defense", "Automotive"],
    featured: true,
    image: p4,
    inStock: true,
    isEnquiry: true,
  },
  {
    id: "qt-power-harness",
    sku: "QT-PWR-HARNESS",
    name: "High-Current DC Power Cable Assembly",
    category: "Cable Assemblies",
    subCategory: "Power Cable Assemblies",
    brand: "Qualitech",
    description: "Heavy-duty flexible power cable assembly with hydraulic-crimped terminals for battery packs, solar inverters and EV charging stations.",
    features: [
      "Ultra-flexible annealed stranded copper",
      "Flame-retardant, oil and acid resistant jacket",
      "High continuous current capacity",
    ],
    specs: {
      Voltage: "1000V DC / 600V AC",
      Current: "Up to 135A Continuous",
      "Temp Range": "-40°C to +105°C",
      Compliance: "UL 1283, SAE J1127",
    },
    industries: ["Power & Energy", "EV Charging", "Railways"],
    featured: false,
    image: cardConnectors,
    inStock: true,
    isEnquiry: true,
  },
  {
    id: "qt-defense-harness",
    sku: "QT-MIL-HARN-01",
    name: "Ruggedized Defense Grade Cable Harness",
    category: "Cable Assemblies",
    subCategory: "Defense Cable Assemblies",
    brand: "Qualitech",
    description: "Hermetically sealed military cable assembly with stainless steel backshells, tin-plated copper overbraid shielding for harsh environments.",
    features: [
      "100% EMI/EMP shielding with tinned braid",
      "Chemical, fuel and salt spray resistant jacket",
      "IPC/WHMA-A-620 Class 3 certified",
    ],
    specs: {
      "IP Rating": "IP68 Submersible",
      Voltage: "1000V RMS",
      "Temp Range": "-65°C to +175°C",
      Compliance: "MIL-STD-810, MIL-DTL-38999",
    },
    industries: ["Defense", "Railways", "Telecommunications"],
    featured: true,
    image: indDefense,
    inStock: true,
    isEnquiry: true,
  },
  {
    id: "qt-oem-solution",
    sku: "QT-SOL-OEM-FULL",
    name: "Turnkey OEM Connectivity Solution",
    category: "Cable Assemblies",
    subCategory: "Custom Wire Harnesses",
    brand: "Qualitech",
    description: "Complete design-in support, BOM rationalization, custom harness routing optimization and 100% electrical continuity & hipot testing.",
    features: [
      "Comprehensive DFM review",
      "Component substitution & cost optimization",
      "Full batch inspection reports with serialized labels",
      "Prototype to volume production",
    ],
    specs: {
      Compliance: "ISO 9001, IPC/WHMA-A-620 Class 3, RoHS, REACH",
    },
    industries: ["Defense", "Railways", "Telecommunications", "Power & Energy", "Automotive"],
    featured: true,
    image: cardFacilities,
    inStock: true,
    isEnquiry: true,
  },
];
