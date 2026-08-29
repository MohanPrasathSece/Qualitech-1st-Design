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
  price?: number;
  category: "Connectors" | "Cable Assemblies" | "Fiber Optic Solutions" | "Antenna Solutions" | "Custom Solutions";
  subCategory: string;
  description: string;
  features: string[];
  specs: {
    contacts?: string;
    plating?: string;
    voltage?: string;
    current?: string;
    tempRange?: string;
    ipRating?: string;
    impedance?: string;
    compliance?: string;
  };
  industries: string[];
  featured?: boolean;
  image: string;
  inStock: boolean;
}

export function getProductPrice(p: Product): number {
  if (p.price) return p.price;
  const hash = p.sku.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((hash % 12) + 1) * 65 + 45;
}

export const CATEGORIES = [
  "All Products",
  "Connectors",
  "Cable Assemblies",
  "Fiber Optic Solutions",
  "Antenna Solutions",
  "Custom Solutions",
] as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  Connectors: [
    "D-Sub Connectors",
    "D-Sub Accessories",
    "DIN (Euro) Connectors",
    "IDC (FRC) Connectors",
    "Harting DIN Connectors",
    "Circular Connectors",
    "RF Connectors",
    "PCB Connectors",
    "Terminal Blocks",
    "Industrial Connectors",
  ],
  "Cable Assemblies": [
    "Custom Wire Harnesses",
    "Ribbon Cable Assemblies",
    "RF Cable Assemblies",
    "Power Cable Assemblies",
    "Data Cable Assemblies",
    "Industrial Cable Assemblies",
    "Telecom Cable Assemblies",
    "Defense Cable Assemblies",
  ],
  "Fiber Optic Solutions": [
    "Fiber Optic Cable Assemblies",
    "Fiber Connectors",
    "Fiber Patch Cords",
    "Fiber Adapters",
    "Fiber Accessories",
  ],
  "Antenna Solutions": [
    "GNSS Antennas",
    "GPS Antennas",
    "Cellular Antennas",
    "Wi-Fi Antennas",
    "External Antennas",
    "Embedded Antennas",
    "IoT Antennas",
  ],
  "Custom Solutions": [
    "Application-Specific Harnesses",
    "OEM Connectivity Solutions",
    "Custom Connector Solutions",
    "Prototype Development",
    "Engineering Support",
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

export const PRODUCTS: Product[] = [
  // ─── Featured Highlight: 86094648109755E1LF ───
  {
    id: "prod-86094648109755E1LF",
    sku: "86094648109755E1LF",
    name: "DIN 41612 96-Way C-Type Receptacle Connector",
    category: "Connectors",
    subCategory: "DIN (Euro) Connectors",
    description: "96-position 3-row Type C female DIN 41612 receptacle with selective gold plating on mating zone. Engineered for backplane racks, Eurocard enclosures and high-density industrial control modules.",
    features: [
      "96 Pins arranged in 3 rows (Rows a, b, c x 32)",
      "Selective hard gold plating on contact active zone",
      "High dielectric withstand voltage for mission-critical racks",
      "Robust polyester PBT body, flame retardant UL94V-0",
    ],
    specs: {
      contacts: "96 Contacts (3x32)",
      plating: "Selective Gold over Nickel",
      voltage: "250V AC",
      current: "2.0A per contact",
      tempRange: "-55°C to +125°C",
      compliance: "DIN 41612, IEC 60603-2, RoHS",
    },
    industries: ["Telecommunications", "Defense", "Railways", "Industrial Automation"],
    featured: true,
    image: p1,
    inStock: true,
  },

  // ─── Connectors: D-Sub ───
  {
    id: "prod-dsub-9m",
    sku: "QT-DB09M-STD",
    name: "DB9 Male Solder Cup Connector",
    category: "Connectors",
    subCategory: "D-Sub Connectors",
    description: "Standard density 9-pin male D-sub connector with stamped and formed gold-plated contacts. Suitable for RS-232, serial communication, and industrial instrumentation.",
    features: [
      "Machined & stamped gold flash contacts",
      "Tin-plated steel shell with grounding dimples",
      "Compatible with all standard DB9 hoods and backshells",
    ],
    specs: {
      contacts: "9 Pin (Male)",
      plating: "Gold Plated over Nickel",
      voltage: "300V AC/DC",
      current: "5A per contact",
      tempRange: "-55°C to +105°C",
      compliance: "RoHS Compliant",
    },
    industries: ["Telecommunications", "Industrial Automation", "Consumer Electronics"],
    featured: true,
    image: p1,
    inStock: true,
  },
  {
    id: "prod-dsub-9f",
    sku: "QT-DB09F-STD",
    name: "DB9 Female Panel Mount Connector",
    category: "Connectors",
    subCategory: "D-Sub Connectors",
    description: "Standard density 9-pin female D-sub connector with threaded hex lock inserts for secure panel retention in chassis and enclosure pass-throughs.",
    features: [
      "High reliability phosphor bronze female sockets",
      "Pre-assembled 4-40 UNC threaded hex standoffs",
      "Ideal for rugged serial communications",
    ],
    specs: {
      contacts: "9 Pin (Female)",
      plating: "Flash Gold",
      voltage: "300V AC/DC",
      current: "5A per contact",
      tempRange: "-55°C to +105°C",
      compliance: "RoHS Compliant",
    },
    industries: ["Telecommunications", "Railways", "Industrial Automation"],
    featured: false,
    image: p2,
    inStock: true,
  },
  {
    id: "prod-dsub-25m",
    sku: "QT-DB25M-IND",
    name: "DB25 Male Heavy-Duty Industrial Connector",
    category: "Connectors",
    subCategory: "D-Sub Connectors",
    description: "25-pin D-sub male connector for parallel ports, multi-channel CNC machines, legacy communication interfaces, and railway test rigs.",
    features: [
      "Precision brass contacts with 15µin gold plating",
      "Sturdy steel shell with grounding indents",
      "UL94V-0 rated insulator block",
    ],
    specs: {
      contacts: "25 Pin (Male)",
      plating: "15µin Gold Plated",
      voltage: "500V AC",
      current: "7.5A peak",
      tempRange: "-55°C to +125°C",
      compliance: "MIL-C-24308 compatible",
    },
    industries: ["Defense", "Railways", "Industrial Automation"],
    featured: false,
    image: p1,
    inStock: true,
  },
  {
    id: "prod-dsub-acc-hood",
    sku: "QT-DB-HOOD-MET",
    name: "Metalized EMI Shielded D-Sub Backshell Hood",
    category: "Connectors",
    subCategory: "D-Sub Accessories",
    description: "Die-cast metalized thermoplastic D-sub shell hood with integrated cable clamp and 4-40 UNC thumb screws for superior 360° EMI/RFI shielding.",
    features: [
      "High attenuation against electromagnetic interference",
      "Includes rubber grommet kit for multiple cable diameters",
      "Heavy-duty knurled metal jackscrews",
    ],
    specs: {
      ipRating: "IP40",
      tempRange: "-40°C to +120°C",
      compliance: "RoHS, REACH",
    },
    industries: ["Defense", "Telecommunications", "Railways"],
    featured: false,
    image: p5,
    inStock: true,
  },

  // ─── Connectors: DIN & Harting & IDC ───
  {
    id: "prod-din-64b",
    sku: "QT-DIN64B-M",
    name: "DIN 41612 Type B 64-Pin Male Plug",
    category: "Connectors",
    subCategory: "DIN (Euro) Connectors",
    description: "2-row 64-way DIN 41612 standard Eurocard plug connector for PCB daughter-card to motherboard racking applications.",
    features: [
      "2 rows (Rows a and b) x 32 positions",
      "Straight through-hole PCB solder tails",
      "Low insertion force for modular card swapping",
    ],
    specs: {
      contacts: "64 Contacts",
      plating: "Gold Class II",
      voltage: "250V AC",
      current: "2.0A",
      tempRange: "-55°C to +125°C",
      compliance: "DIN 41612",
    },
    industries: ["Telecommunications", "Power & Energy", "Industrial Automation"],
    featured: true,
    image: p3,
    inStock: true,
  },
  {
    id: "prod-harting-din",
    sku: "QT-HAR-DIN96",
    name: "Harting DIN 41612 High Reliability Interface",
    category: "Connectors",
    subCategory: "Harting DIN Connectors",
    description: "Authentic Harting compatible high-grade DIN 41612 industrial interconnect with glass-filled thermoplastic body and robust terminal retention.",
    features: [
      "Extreme vibration and shock resistance",
      "Performance level 1 rating (500 mating cycles)",
      "Engineered for railway signaling and power grid substations",
    ],
    specs: {
      contacts: "96 Pin (3 Rows)",
      plating: "Hard Gold",
      voltage: "300V",
      current: "2.5A",
      tempRange: "-65°C to +125°C",
      compliance: "EN 60603-2, IEC 60068",
    },
    industries: ["Railways", "Power & Energy", "Defense"],
    featured: false,
    image: p3,
    inStock: true,
  },
  {
    id: "prod-idc-20p",
    sku: "QT-IDC-20P-SKT",
    name: "IDC 20-Pin Socket with Strain Relief (2.54mm)",
    category: "Connectors",
    subCategory: "IDC (FRC) Connectors",
    description: "Insulation displacement connector (IDC) socket with polarization key and dual-beam phosphor bronze tuning fork contacts for flat ribbon cables.",
    features: [
      "Center bump polarization and dual strain relief clip",
      "Quick gas-tight termination on 1.27mm pitch ribbon cable",
      "Gold flash on mating area",
    ],
    specs: {
      contacts: "20 Pin (2x10)",
      plating: "Gold Plating over Nickel",
      voltage: "250V AC",
      current: "1.0A",
      tempRange: "-40°C to +105°C",
      compliance: "RoHS",
    },
    industries: ["Consumer Electronics", "Telecommunications", "Industrial Automation"],
    featured: false,
    image: p2,
    inStock: true,
  },
  {
    id: "prod-circ-m12",
    sku: "QT-M12-08M-PG9",
    name: "M12 8-Pin Circular Sensor Connector (A-Coded)",
    category: "Connectors",
    subCategory: "Circular Connectors",
    description: "Industrial IP67 waterproof M12 circular male connector with brass nickel-plated housing and screw-joint wire termination for sensors, actuators and fieldbus nodes.",
    features: [
      "IP67 / IP68 ingress protection against liquids and fine dust",
      "A-coded keying for sensors and DC power distribution",
      "Knurled brass coupling nut with anti-vibration detent",
    ],
    specs: {
      contacts: "8 Poles",
      ipRating: "IP67 / IP68",
      voltage: "60V",
      current: "2A",
      tempRange: "-40°C to +85°C",
      compliance: "IEC 61076-2-101",
    },
    industries: ["Industrial Automation", "Automotive", "EV Charging"],
    featured: true,
    image: p1,
    inStock: true,
  },
  {
    id: "prod-terminal-block",
    sku: "QT-TB-508-08P",
    name: "5.08mm Pluggable Screw Terminal Block Set",
    category: "Connectors",
    subCategory: "Terminal Blocks",
    description: "High-temperature green polyamide terminal block plug and PCB socket set. Accepts wires from 28 AWG to 12 AWG with zinc-plated clamping cages.",
    features: [
      "Right-angle PCB mount header with mating plug",
      "Rising cage clamp for vibration-proof wire grip",
      "Clear pole number marking for error-free wiring",
    ],
    specs: {
      contacts: "8 Pole",
      voltage: "300V AC",
      current: "15A",
      tempRange: "-40°C to +105°C",
      compliance: "UL, CE, RoHS",
    },
    industries: ["Power & Energy", "Industrial Automation", "EV Charging"],
    featured: false,
    image: p6,
    inStock: true,
  },

  // ─── Cable Assemblies ───
  {
    id: "prod-harness-custom",
    sku: "QT-HARN-OEM-01",
    name: "Multi-Branch Custom Wire Harness Assembly",
    category: "Cable Assemblies",
    subCategory: "Custom Wire Harnesses",
    description: "Precision point-to-point engineered wire harness with multiple branches, braided nylon sleeving, heat-shrink strain relief and 100% automated continuity testing.",
    features: [
      "Custom routing and branch breakouts for exact OEM chassis fit",
      "Automated cut, strip, crimp and digital pull-force testing",
      "Custom laser-printed heat-shrink wire identification sleeves",
    ],
    specs: {
      voltage: "Up to 600V",
      current: "Engineered per circuit (1A to 40A)",
      tempRange: "-40°C to +125°C",
      compliance: "IPC/WHMA-A-620 Class 3, ISO 9001",
    },
    industries: ["Defense", "Railways", "Telecommunications", "EV Charging"],
    featured: true,
    image: heroHarness,
    inStock: true,
  },
  {
    id: "prod-ribbon-frc",
    sku: "QT-CA-FRC-26",
    name: "26-Way Shielded Flat Ribbon Cable Assembly",
    category: "Cable Assemblies",
    subCategory: "Ribbon Cable Assemblies",
    description: "Custom length flat ribbon cable terminated with dual 26-pin IDC sockets, aluminum foil shielding, and drain wire for noise-immune high-speed internal bus links.",
    features: [
      "High flexibility 28 AWG stranded tinned copper conductors",
      "Optional aluminum Mylar foil wrap with PVC outer sleeve",
      "Zero insertion resistance and 100% pin-out verified",
    ],
    specs: {
      contacts: "26 Conductor (1.27mm wire pitch)",
      voltage: "300V RMS",
      current: "1.0A",
      tempRange: "-20°C to +105°C",
      compliance: "UL2651, RoHS",
    },
    industries: ["Telecommunications", "Industrial Automation", "Consumer Electronics"],
    featured: false,
    image: cardCable,
    inStock: true,
  },
  {
    id: "prod-rf-sma-cable",
    sku: "QT-RF-SMA-RG316",
    name: "RG316 Low-Loss Coaxial RF Cable Assembly (SMA to SMA)",
    category: "Cable Assemblies",
    subCategory: "RF Cable Assemblies",
    description: "Precision 50-ohm RF coaxial lead with gold-plated brass SMA male straight connectors and PTFE dielectric silver-plated copper conductors for up to 6 GHz RF links.",
    features: [
      "Extremely flexible silver-plated copper clad steel (SCCS)",
      "High temperature FEP jacket resistant to oils and chemicals",
      "Tested for VSWR < 1.25 up to 3 GHz",
    ],
    specs: {
      impedance: "50 Ohm",
      voltage: "1200V RMS",
      tempRange: "-55°C to +200°C",
      compliance: "MIL-C-17, RoHS",
    },
    industries: ["Telecommunications", "Defense", "Automotive"],
    featured: true,
    image: p4,
    inStock: true,
  },
  {
    id: "prod-power-harness",
    sku: "QT-PWR-4AWG-LUG",
    name: "High-Current DC Power Cable Assembly (4 AWG)",
    category: "Cable Assemblies",
    subCategory: "Power Cable Assemblies",
    description: "Heavy-duty flexible power lead with dual-wall adhesive-lined heat shrink and hydraulic-crimped tinned copper ring terminals for battery packs and solar inverters.",
    features: [
      "Ultra-flexible Class K annealed stranded copper",
      "Flame-retardant, oil, fuel and acid resistant PVC jacket",
      "Continuous current capacity up to 135A",
    ],
    specs: {
      voltage: "1000V DC / 600V AC",
      current: "135A Continuous",
      tempRange: "-40°C to +105°C",
      compliance: "UL 1283, SAE J1127",
    },
    industries: ["Power & Energy", "EV Charging", "Railways"],
    featured: false,
    image: cardConnectors,
    inStock: true,
  },
  {
    id: "prod-defense-harness",
    sku: "QT-MIL-CIRC-HARN",
    name: "Ruggedized Defense Grade MIL-DTL Circular Harness",
    category: "Cable Assemblies",
    subCategory: "Defense Cable Assemblies",
    description: "Hermetically sealed military cable assembly with stainless steel backshells, tin-plated copper overbraid shielding and silicone grommets for harsh battlefield environments.",
    features: [
      "100% EMI/EMP shielding with 95% optical coverage tinned braid",
      "Chemical, fuel and salt spray resistant outer fluoropolymer jacket",
      "Certified to IPC/WHMA-A-620 Class 3 (High Reliability / Military)",
    ],
    specs: {
      ipRating: "IP68 Submersible",
      voltage: "1000V RMS",
      tempRange: "-65°C to +175°C",
      compliance: "MIL-STD-810, MIL-DTL-38999",
    },
    industries: ["Defense", "Railways", "Telecommunications"],
    featured: true,
    image: indDefense,
    inStock: true,
  },

  // ─── Fiber Optic Solutions ───
  {
    id: "prod-fiber-patch",
    sku: "QT-FO-LCLC-SM",
    name: "LC to LC Duplex Single-Mode Fiber Patch Cord (9/125µm)",
    category: "Fiber Optic Solutions",
    subCategory: "Fiber Patch Cords",
    description: "Low Smoke Zero Halogen (LSZH) armored single-mode fiber patch cord with zirconia ceramic ferrule LC duplex connectors for high-bandwidth data centers and telecom backhauls.",
    features: [
      "Ultra-low insertion loss (≤ 0.2dB) and high return loss (≥ 55dB)",
      "LSZH flame-retardant outer jacket with Kevlar aramid yarn",
      "Individually interferometrically tested with inspection test report",
    ],
    specs: {
      tempRange: "-40°C to +85°C",
      compliance: "TIA/EIA 604-10, Telcordia GR-326, RoHS",
    },
    industries: ["Telecommunications", "Power & Energy", "Defense"],
    featured: true,
    image: indTelecom,
    inStock: true,
  },
  {
    id: "prod-fiber-conn-sc",
    sku: "QT-FO-CONN-SC",
    name: "SC/APC Single-Mode Simplex Field Connector",
    category: "Fiber Optic Solutions",
    subCategory: "Fiber Connectors",
    description: "Field-installable SC connector with angle-polished APC 8° ceramic ferrule for high return loss telecommunication and GPON networks.",
    features: [
      "Snap-in push-pull coupling mechanism",
      "High durability over 1,000 mating cycles",
      "Suitable for 0.9mm, 2.0mm, and 3.0mm fiber cables",
    ],
    specs: {
      tempRange: "-40°C to +80°C",
      compliance: "IEC 61754-4",
    },
    industries: ["Telecommunications", "Industrial Automation"],
    featured: false,
    image: p3,
    inStock: true,
  },
  {
    id: "prod-fiber-adapter",
    sku: "QT-FO-ADP-LCDX",
    name: "LC Duplex Singlemode Flanged Adapter Coupler",
    category: "Fiber Optic Solutions",
    subCategory: "Fiber Adapters",
    description: "Precision zirconia sleeve LC duplex female-to-female adapter for patch panel and fiber distribution hub bulkheads.",
    features: [
      "High-precision alignment sleeve for negligible loss",
      "Integrated snap clip and screw mounting flange",
      "Protective dust caps included on both ports",
    ],
    specs: {
      tempRange: "-40°C to +85°C",
      compliance: "RoHS, REACH",
    },
    industries: ["Telecommunications", "Power & Energy"],
    featured: false,
    image: p2,
    inStock: true,
  },

  // ─── Antenna Solutions ───
  {
    id: "prod-ant-gnss",
    sku: "QT-ANT-GNSS-EXT",
    name: "High Precision Multi-Band GNSS Antenna (GPS/GLONASS/Galileo)",
    category: "Antenna Solutions",
    subCategory: "GNSS Antennas",
    description: "External screw-mount or magnetic IP67 dome antenna with integrated low noise amplifier (LNA) for centimetre-level GPS, GLONASS, BeiDou and Galileo timing and navigation.",
    features: [
      "Covers L1, L2, L5 GPS and multi-constellation GNSS bands",
      "28 dB high-gain LNA with active filtering against out-of-band noise",
      "Rugged UV-stabilized polycarbonate radome rated IP67",
    ],
    specs: {
      impedance: "50 Ohm",
      ipRating: "IP67 Waterproof",
      voltage: "2.7V - 5.0V DC",
      tempRange: "-40°C to +85°C",
      compliance: "CE, FCC, RoHS",
    },
    industries: ["Telecommunications", "Railways", "Automotive", "Defense"],
    featured: true,
    image: p1,
    inStock: true,
  },
  {
    id: "prod-ant-5g-cellular",
    sku: "QT-ANT-5G-PUCK",
    name: "5G/4G LTE Wideband Puck Antenna (600MHz - 6GHz)",
    category: "Antenna Solutions",
    subCategory: "Cellular Antennas",
    description: "Vandal-resistant low-profile outdoor roof-mount antenna for smart grid meters, telemetry kiosks, EV charging stations and fleet tracking gateways.",
    features: [
      "Omni-directional high efficiency across sub-6GHz 5G bands",
      "IK09 impact resistant housing and IP69K high pressure water washdown",
      "Integrated 1.5m low loss RG58 cable with male SMA connector",
    ],
    specs: {
      impedance: "50 Ohm",
      ipRating: "IP69K / IK09",
      tempRange: "-40°C to +85°C",
      compliance: "RoHS, ISO 9001",
    },
    industries: ["EV Charging", "Telecommunications", "Industrial Automation"],
    featured: true,
    image: p2,
    inStock: true,
  },
  {
    id: "prod-ant-wifi-dual",
    sku: "QT-ANT-WIFI-DIP",
    name: "Dual-Band 2.4GHz / 5.8GHz High-Gain Dipole Antenna",
    category: "Antenna Solutions",
    subCategory: "Wi-Fi Antennas",
    description: "Articulated rubber duck dipole antenna with RP-SMA male connector for industrial IoT gateways, routers, Wi-Fi 6 APs and wireless control cards.",
    features: [
      "5 dBi peak gain on 2.4 GHz and 5.8 GHz ISM bands",
      "90° swivel elbow joint for flexible spatial orientation",
      "Gold-plated center conductor pin for low signal attenuation",
    ],
    specs: {
      impedance: "50 Ohm",
      voltage: "10W max input",
      tempRange: "-30°C to +75°C",
      compliance: "RoHS",
    },
    industries: ["Industrial Automation", "Consumer Electronics"],
    featured: false,
    image: p3,
    inStock: true,
  },
  {
    id: "prod-ant-iot-embedded",
    sku: "QT-ANT-EMB-FPC",
    name: "Internal FPC Flexible IoT Antenna (NB-IoT / LoRa / LTE-M)",
    category: "Antenna Solutions",
    subCategory: "IoT Antennas",
    description: "Ultra-thin adhesive flexible printed circuit (FPC) antenna with IPEX / U.FL micro coaxial lead for compact IoT tracker and sensor enclosures.",
    features: [
      "Peel-and-stick 3M 467MP adhesive backing for curved plastic walls",
      "Tuned for 868 MHz / 915 MHz LoRa and Global NB-IoT frequencies",
      "Micro-coaxial 1.13mm cable terminated with genuine IPEX MHF1",
    ],
    specs: {
      impedance: "50 Ohm",
      tempRange: "-40°C to +85°C",
      compliance: "RoHS Compliant",
    },
    industries: ["Consumer Electronics", "Industrial Automation", "Power & Energy"],
    featured: false,
    image: p4,
    inStock: true,
  },

  // ─── Custom Solutions ───
  {
    id: "prod-custom-oem-sol",
    sku: "QT-SOL-OEM-FULL",
    name: "Turnkey OEM Connectivity Engineering & Manufacturing",
    category: "Custom Solutions",
    subCategory: "OEM Connectivity Solutions",
    description: "Complete design-in support, BOM rationalization, custom tool design, harness routing optimization and 100% electrical continuity & hipot testing.",
    features: [
      "Comprehensive DFM (Design for Manufacturability) review",
      "Component substitution & cost optimization with authorized global brands",
      "Full batch inspection reports with serialized barcode labels",
      "Turnkey assembly from prototype run to volume production",
    ],
    specs: {
      compliance: "ISO 9001, IPC/WHMA-A-620 Class 3, RoHS, REACH",
    },
    industries: ["Defense", "Railways", "Telecommunications", "Power & Energy", "Automotive"],
    featured: true,
    image: cardFacilities,
    inStock: true,
  },
  {
    id: "prod-custom-proto",
    sku: "QT-SOL-PROTO-RAPID",
    name: "Rapid Harness & Connector Prototype Development",
    category: "Custom Solutions",
    subCategory: "Prototype Development",
    description: "Fast-track engineering and sample manufacturing for urgent NPI (New Product Introduction), testing rigs, and verification runs with full test documentation.",
    features: [
      "First-article inspection reports (FAIR) and pin-out diagrams",
      "Short-run pilot batches with 7-10 day turnaround capability",
      "Dedicated prototyping bench with certified harness technicians",
    ],
    specs: {
      compliance: "MIL-STD, IPC/WHMA-A-620, ISO 9001",
    },
    industries: ["Defense", "Industrial Automation", "EV Charging", "Consumer Electronics"],
    featured: false,
    image: heroHarness,
    inStock: true,
  },
  {
    id: "prod-custom-support",
    sku: "QT-SOL-ENG-SUPP",
    name: "Engineering Support & Reverse Engineering Services",
    category: "Custom Solutions",
    subCategory: "Engineering Support",
    description: "Assistance with legacy wire harness replacement, schematic drawing generation, component obsolescence management, and testing procedure development.",
    features: [
      "Physical sample reverse engineering to create CAD schematics and wire schedules",
      "Hard-to-find connector cross-referencing and drop-in alternatives",
      "On-site technical consultation for complex enclosure wiring",
    ],
    specs: {
      compliance: "ISO 9001 Certified",
    },
    industries: ["Railways", "Defense", "Power & Energy"],
    featured: false,
    image: cardConnectors,
    inStock: true,
  },
];
