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
    "Zolex — Components",
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
    name: "Wi-Fi & IoT Antennas",
    category: "Electronics Components",
    subCategory: "Amphenol — Antennas",
    brand: "Amphenol",
    description: "Amphenol dual-band Wi-Fi and IoT antennas — dipole, PCB-mount and embedded variants for wireless connectivity.",
    features: [
      "2.4 GHz and 5 GHz dual-band",
      "Flexible FPC and rigid PCB options",
      "Compact embedded designs",
    ],
    specs: {
      Brand: "Amphenol",
      Type: "Wi-Fi / IoT Antenna",
      Application: "Wireless, Smart Devices, Industrial IoT",
    },
    industries: ["Consumer Electronics", "Industrial Automation"],
    featured: false,
    image: p4,
    inStock: true,
    externalUrl: "https://www.amphenol-cs.com/product-series/wi-fi-bluetooth.html",
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
  // ZOLEX — Products
  // ═══════════════════════════════════════════
  {
    id: "zolex-copper-lugs-1",
    sku: "ZOLEX-LUG-CU-01",
    name: "Copper Tube Crimping Lugs (Inspection Window)",
    category: "Electronics Components",
    subCategory: "Zolex — Components",
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
    id: "zolex-terminals-ring",
    sku: "ZOLEX-TERM-RING",
    name: "Insulated Ring & Fork Crimp Terminals",
    category: "Electronics Components",
    subCategory: "Zolex — Components",
    brand: "Zolex",
    description: "Zolex color-coded vinyl and nylon insulated ring and fork crimp terminals for high-vibration control panel and switchgear wiring.",
    features: [
      "Brazed seam barrel prevents splitting under crimping",
      "Funnel wire entry for swift conductor insertion",
      "Color-coded (Red, Blue, Yellow) per wire gauge",
    ],
    specs: {
      Brand: "Zolex",
      Type: "Insulated Crimp Terminals",
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
    id: "zolex-ss-cable-ties",
    sku: "ZOLEX-TIE-SS316",
    name: "Roller Ball Lock Stainless Steel Cable Ties",
    category: "Electronics Components",
    subCategory: "Zolex — Components",
    brand: "Zolex",
    description: "Grade 304 and 316 stainless steel roller ball self-locking cable ties, coated and uncoated, for harsh outdoor, marine, and high-temp environments.",
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
    id: "zolex-cable-glands",
    sku: "ZOLEX-GLAND-FLAME",
    name: "Double Compression Flameproof Cable Glands",
    category: "Electronics Components",
    subCategory: "Zolex — Components",
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
    image: p6,
    inStock: true,
    externalUrl: "https://zolex.in/product/double-compression-flameproof-cable-gland/",
  },
  {
    id: "zolex-earth-rods",
    sku: "ZOLEX-EARTH-ROD",
    name: "Copper Bonded Earth Rods & Accessories",
    category: "Electronics Components",
    subCategory: "Zolex — Components",
    brand: "Zolex",
    description: "Molecularly copper bonded steel core earth grounding rods and heavy-duty clamps for sub-station and industrial lightning protection.",
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
    image: p4,
    inStock: true,
    externalUrl: "https://zolex.in/product/copper-bonded-earth-rod/",
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
