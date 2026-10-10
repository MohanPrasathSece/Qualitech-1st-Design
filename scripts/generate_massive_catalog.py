import json
import re
import os
import urllib.request

# 1. Amphenol Product Line Expansion
amphenol_expanded = [
    # --- GNSS & Antennas ---
    {
        "id": "amp-gnss-01",
        "sku": "AMPHENOL-GNSS-ACT-L1L2L5",
        "name": "High Precision GNSS Multi-Band Active Patch Antenna (L1/L2/L5)",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Industrial grade high-precision GNSS active antenna supporting GPS, GLONASS, Galileo, and BeiDou frequencies (L1/L2/L5/E1/E5b) for RTK and centimeter-level positioning accuracy.",
        "features": [
            "Multi-band support: GPS L1/L2/L5, GLONASS G1/G2, Galileo E1/E5b, BeiDou B1/B2/B3",
            "High gain LNA (28dB - 38dB) with low noise figure (<1.5dB)",
            "IP67 / IP69K weatherproof enclosure with UV resistant casing",
            "Pre-filtered high out-of-band rejection for cellular & Wi-Fi immunity"
        ],
        "specs": {
            "Frequency Range": "1164 - 1610 MHz",
            "Peak Gain": "38 dBi max",
            "Impedance": "50 Ohms",
            "VSWR": "< 1.5:1",
            "Connector Type": "SMA Plug / TNC / FAURA",
            "Mounting Type": "Screw Mount / Magnetic Mount"
        },
        "industries": ["Autonomous Vehicles", "Precision Agriculture", "Surveying & Geodesy", "Telematics"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 4850,
        "stockCount": 150,
        "unit": "pcs",
        "leadTime": "24-48 Hours",
        "datasheetUrl": "https://www.amphenol-cs.com/product-series/gnss.html"
    },
    {
        "id": "amp-gnss-02",
        "sku": "AMPHENOL-GNSS-FPC-L1L5",
        "name": "Embedded Flexible FPC Dual-Band GNSS Antenna (L1/L5)",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Ultra-thin flexible printed circuit (FPC) internal antenna optimized for compact IoT devices, wearables, and asset trackers requiring precise GPS/GNSS location tracking.",
        "features": [
            "Dual-band L1 + L5 GNSS capability",
            "Flexible 3M adhesive backing for quick installation inside plastic housings",
            "Micro-coaxial cable assembly with IPEX MHF4 / U.FL connector"
        ],
        "specs": {
            "Frequency": "1575.42 MHz & 1176.45 MHz",
            "Dimensions": "40 x 15 x 0.2 mm",
            "Impedance": "50 Ohms",
            "Cable Length": "100mm micro-coax"
        },
        "industries": ["IoT & Smart City", "Asset Tracking", "Wearables"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 1250,
        "stockCount": 300,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-gnss-03",
        "sku": "AMPHENOL-GNSS-DOME-5IN1",
        "name": "Rugged Vehicle Dome GNSS + 5G + Wi-Fi 6E Combo Antenna",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Heavy-duty 5-in-1 multi-purpose vehicle antenna featuring high-precision GNSS positioning, 2x2 MIMO 5G/4G LTE, and 2x2 MIMO Wi-Fi 6E for fleet telematics and emergency vehicles.",
        "features": [
            "5-in-1 integrated dome design: 1x GNSS, 2x 5G/4G, 2x Wi-Fi 6E",
            "High impact IK10 & IP69K waterproof rating",
            "Heavy-duty bolt mount through vehicle roof"
        ],
        "specs": {
            "GNSS Band": "GPS L1/L2, GLONASS, BeiDou, Galileo",
            "Cellular Band": "617 - 5925 MHz (5G NR Sub-6GHz)",
            "IP Rating": "IP67 / IP69K"
        },
        "industries": ["Automotive", "Public Safety", "Fleet Telematics"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 9200,
        "stockCount": 85,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-gnss-04",
        "sku": "AMPHENOL-GNSS-MAG-SURVEY",
        "name": "Survey Grade High-Gain Active GNSS Antenna with Choke Ring",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Geodetic survey grade GNSS antenna with multipath rejection technology and integrated choke ring for base stations and reference monitoring.",
        "features": [
            "Full constellation tracking (GPS, GLONASS, Galileo, BeiDou, QZSS, IRNSS)",
            "Sub-millimeter phase center stability",
            "Heavy aluminum housing with IP68 seal"
        ],
        "specs": {
            "Frequency": "1164 - 1610 MHz",
            "Gain": "40 dBi",
            "Noise Figure": "< 1.2 dB"
        },
        "industries": ["Surveying & Geodesy", "Mining & Construction"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 14500,
        "stockCount": 40,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-ant-5g-01",
        "sku": "AMPHENOL-5G-PUCK-EXT",
        "name": "5G NR Sub-6GHz & 4G LTE High Gain External Puck Antenna",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "5G & 4G LTE Cellular Antennas",
        "description": "Wideband 617-5925 MHz cellular puck antenna for industrial routers, kiosks, and smart metering enclosures.",
        "features": ["Covers global 5G Sub-6GHz and legacy 4G/3G/2G bands", "Vandal-resistant low-profile housing", "SMA male connector lead"],
        "specs": {"Frequency": "617-5925 MHz", "Gain": "5 dBi", "Connector": "SMA Male"},
        "industries": ["Telecommunications", "Industrial Automation"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 2800,
        "stockCount": 200,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-ant-wifi-01",
        "sku": "AMPHENOL-WIFI6E-DIPOLE",
        "name": "Wi-Fi 6E & Bluetooth 5.3 Tri-Band Terminal Dipole Antenna",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "Wi-Fi 6E & Bluetooth Antennas",
        "description": "Tri-band terminal antenna supporting 2.4 GHz, 5 GHz, and 6 GHz spectrum for high-speed Wi-Fi 6E networking.",
        "features": ["Tri-band 2.4/5/6 GHz operation", "Articulating RP-SMA connector", "High efficiency >75%"],
        "specs": {"Frequency": "2400-7125 MHz", "Gain": "4 dBi", "Connector": "RP-SMA Plug"},
        "industries": ["Telecommunications", "Industrial IoT"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 950,
        "stockCount": 350,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },

    # --- Connectors ---
    {
        "id": "amp-circ-01",
        "sku": "AMPHENOL-CIRC-MIL-38999",
        "name": "MIL-DTL-38999 Series III Circular Connectors",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Board to Board",
        "description": "High-density harsh environment circular connectors engineered for military aerospace and heavy industrial defense systems.",
        "features": ["Tri-start thread coupling mechanism", "100% scoop-proof contact design", "Operates up to 200°C severe thermal environments"],
        "specs": {"Shell Size": "9 to 25", "Contact Count": "2 to 128 pins", "IP Rating": "IP67 / IP68"},
        "industries": ["Defense", "Aerospace", "Marine"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 6800,
        "stockCount": 120,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-ind-01",
        "sku": "AMPHENOL-IND-CIRC-M12",
        "name": "Industrial M12 A-Code / D-Code / X-Code Sensor Connectors",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Wire / Cable / Flex to Board",
        "description": "Compact IP67 sealed M12 circular connectors for industrial automation, fieldbus systems, Single Pair Ethernet (SPE), and 10GbE High-Speed Ethernet.",
        "features": ["Available in A, B, D, K, L, S, T, and X coding", "Shielded metal housing for high EMI suppression"],
        "specs": {"Pin Count": "3, 4, 5, 8, 12 pins", "Current Rating": "Up to 12A per contact", "IP Rating": "IP67 / IP68 sealed"},
        "industries": ["Industrial Automation", "Robotics"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 1450,
        "stockCount": 450,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-ind-02",
        "sku": "AMPHENOL-IND-SPE-IP67",
        "name": "Single Pair Ethernet (SPE) IP67 Connector System",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Wire / Cable / Flex to Board",
        "description": "IEC 63171-6 compliant Single Pair Ethernet interconnect transmitting 1 Gb/s data and up to 50W PoDL over a single twisted pair.",
        "features": ["1 Gb/s up to 40 meters, 10 Mb/s up to 1000 meters", "Power over Data Line (PoDL) up to 50W", "IP67 industrial housing"],
        "specs": {"Standard": "IEC 63171-6", "Bandwidth": "600 MHz", "Current": "4A max"},
        "industries": ["Industrial Automation", "Robotics", "Process Control"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 1890,
        "stockCount": 220,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-dsub-01",
        "sku": "AMPHENOL-DSUB-STD-09",
        "name": "D-Subminiature Standard & High Density Connectors",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Input / Output (I/O)",
        "description": "Industry standard D-Sub connectors available in 9, 15, 25, 37, and 50 pin counts with solder cup, PCB straight, right angle, and crimp terminations.",
        "features": ["Stamped and formed or machined precision pin contacts", "Steel shell with tin plating for grounding continuity"],
        "specs": {"Positions": "9, 15, 25, 37, 50 pin", "Current Rating": "5A per pin"},
        "industries": ["Telecommunications", "Industrial Automation"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 380,
        "stockCount": 800,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-radsok-01",
        "sku": "AMPHENOL-RADSOK-PWR-01",
        "name": "Heavy Duty RADSOK Power Connectors (Up to 1000A)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Power",
        "description": "Patented RADSOK socket technology featuring twisted hyperbolic grid geometry for maximum contact surface area, extremely low millivolt drop, and high current carrying capability.",
        "features": ["Handles continuous currents from 35A up to 1000A", "Up to 40% more current capacity than standard contacts"],
        "specs": {"Contact Sizes": "2.4mm to 14mm RADSOK pins", "Current Rating": "70A to 1000A"},
        "industries": ["Power & Energy", "EV Charging", "Data Centers"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 3400,
        "stockCount": 210,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-pcb-01",
        "sku": "AMPHENOL-EXAMAX-112G",
        "name": "ExaMAX2 High-Speed Backplane Connector System (112 Gb/s)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Board to Board",
        "description": "Next-generation 112 Gb/s PAM4 high-speed backplane connector system engineered for AI servers, cloud networking, and supercomputers.",
        "features": ["Industry leading signal integrity up to 112 Gb/s PAM4", "Zero skew differential pair design", "Low crosstalk design"],
        "specs": {"Data Rate": "112 Gbps PAM4", "Impedance": "85 / 92 Ohms", "Pitch": "1.8mm"},
        "industries": ["Data Centers", "Telecommunications"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 5600,
        "stockCount": 110,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },

    # --- RF & Micro Coax ---
    {
        "id": "amp-rf-01",
        "sku": "AMPHENOL-RF-CONN-SMA",
        "name": "Precision RF Coaxial Connectors (SMA / BNC / N-Type / TNC)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Input / Output (I/O)",
        "description": "High performance 50 Ohm precision RF coaxial connectors engineered for microwave, telecommunications test equipment, and wireless communications.",
        "features": ["DC to 18 GHz frequency bandwidth", "Gold-plated center conductor contacts"],
        "specs": {"Impedance": "50 Ohms", "Frequency Range": "DC - 18 GHz", "VSWR": "< 1.15:1"},
        "industries": ["Telecommunications", "Test & Measurement"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 620,
        "stockCount": 600,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-rf-02",
        "sku": "AMPHENOL-MICRO-IPEX-UFL",
        "name": "Micro-Miniature RF Connectors & Cables (MCX / MMCX / IPEX MHF)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Input / Output (I/O)",
        "description": "Ultra micro coaxial connectors and 0.81mm / 1.13mm / 1.37mm jumper cables for compact wireless modules and GNSS receivers.",
        "features": ["Ultra-low mated height down to 1.2mm", "DC to 6 GHz operation", "Snap-on coupling"],
        "specs": {"Impedance": "50 Ohms", "Mated Height": "1.2mm - 2.5mm", "Cable Gauge": "0.81mm micro coax"},
        "industries": ["Telecommunications", "IoT & Smart City"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 340,
        "stockCount": 750,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },

    # --- Fiber Optics & EV ---
    {
        "id": "amp-fo-01",
        "sku": "AMPHENOL-FO-PATCH-LC-SC",
        "name": "Fiber Optic Connectors & Optical Patch Cords (LC / SC / MPO)",
        "brand": "Amphenol",
        "category": "Fiber Optics",
        "subCategory": "Fiber Optic Connectors & Patch Cords",
        "description": "Single-mode OS2 and multi-mode OM3/OM4 optical fiber patch cables equipped with low loss ceramic ferrule LC, SC, and MPO/MTP connectors.",
        "features": ["Ultra low insertion loss (< 0.15 dB)", "100% factory tested", "LSZH flame-retardant outer jacket"],
        "specs": {"Fiber Type": "Single-Mode OS2 / Multi-Mode OM4", "Insertion Loss": "< 0.2 dB"},
        "industries": ["Telecommunications", "Data Centers"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 1850,
        "stockCount": 320,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-fo-02",
        "sku": "AMPHENOL-TAC-FO-MIL",
        "name": "Harsh-Environment Tactical Military Fiber Cable Assembly",
        "brand": "Amphenol",
        "category": "Fiber Optics",
        "subCategory": "Tactical Military Fiber Solutions",
        "description": "Ruggedized 2/4-channel expanded beam tactical fiber optic cable assembly designed for battlefield communications and broadcasting.",
        "features": ["Expanded beam optical technology resistant to dirt & mud", "Hermetically sealed IP68 connectors"],
        "specs": {"Channels": "2 or 4 fiber channels", "IP Rating": "IP68 submerged", "Operating Temp": "-55°C to +85°C"},
        "industries": ["Defense", "Broadcast", "Mining"],
        "featured": False,
        "image": "/logo.png",
        "inStock": True,
        "price": 28500,
        "stockCount": 25,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-ev-01",
        "sku": "AMPHENOL-EV-HVSL-800",
        "name": "EV High-Voltage Interconnect System (HVSL 800 / Excel|Mate)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Power",
        "description": "High voltage 1000V DC electric vehicle power connector designed for EV battery packs, inverters, power distribution units (PDU), and motor controllers.",
        "features": ["Integrated HVIL safety interlock loop", "360° EMI shielding", "Touch-proof IP2X protection"],
        "specs": {"Rated Voltage": "1000V DC", "Current Rating": "Up to 250A continuous", "IP Rating": "IP67 / IP6K9K"},
        "industries": ["Automotive", "EV Charging", "Power & Energy"],
        "featured": True,
        "image": "/logo.png",
        "inStock": True,
        "price": 5400,
        "stockCount": 140,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    }
]

# 2. Zolex Product Line Expansion with Gauges & Variations
gauge_sizes = ["1.5", "2.5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240", "300"]
stud_sizes = ["M4", "M5", "M6", "M8", "M10", "M12", "M16"]

zolex_expanded = []

# Scraped base Zolex products
with open('scripts/zolex_products_scraped.json', 'r', encoding='utf-8') as f:
    zolex_scraped = json.load(f)

for idx, z in enumerate(zolex_scraped):
    name = z.get('name', 'Zolex Product').strip()
    link = z.get('link', '')
    img = z.get('image', '') or '/logo.png'
    
    cat = "Crimp Terminals"
    sub_cat = "Ring Type Terminals"
    if "Lug" in name or "Lugs" in name or "Through Connector" in name:
        if "Aluminium" in name:
            cat = "Aluminium Lugs & Connectors"
            sub_cat = "Aluminium Tube Crimping Lugs"
        elif "Bimetallic" in name:
            cat = "Bimetallic Lugs & Connectors"
            sub_cat = "Bimetallic Crimping Lugs (Al/Cu)"
        else:
            cat = "Copper Lugs & Connectors"
            sub_cat = "Copper Tube Crimping Lugs"
    elif "Fork" in name:
        cat = "Crimp Terminals"
        sub_cat = "Fork Type Terminals"
    elif "Pin" in name:
        cat = "Crimp Terminals"
        sub_cat = "Pin Type Terminals"
    elif "Sleeve" in name or "Ferrule" in name:
        cat = "Crimp Terminals"
        sub_cat = "End Sleeves (Bootlace Ferrules)"
    elif "Tie" in name or "Ties" in name or "Marker" in name:
        cat = "SS Cable Ties"
        sub_cat = "Roller Ball Lock Ties (Coated & Uncoated)"
    elif "Gland" in name or "Glands" in name:
        cat = "Cable Glands & Accessories"
        sub_cat = "Industrial Cable Glands (A2, BW, CW, E1W, A2F)"
    elif "Rod" in name or "Earth" in name:
        cat = "Earthing Accessories"
        sub_cat = "Copper Bonded & Pure Copper Earth Rods"

    sku_slug = re.sub(r'[^A-Z0-9]', '-', name.upper())[:28].strip('-')
    
    zolex_expanded.append({
        "id": f"zolex-prod-{idx+1:03d}",
        "sku": f"ZOLEX-{sku_slug}-{idx+1:02d}",
        "name": f"Zolex {name}",
        "brand": "Zolex",
        "category": cat,
        "subCategory": sub_cat,
        "description": f"Premium Zolex {name} manufactured to IS / DIN standards for electrical panels, power distribution, and industrial wiring.",
        "features": [
            "High conductivity electrolytic grade material",
            "Tin plated finish for maximum corrosion protection",
            "Precision engineered for uniform crimping and low electrical resistance",
            "100% Quality Inspected to ISO standards"
        ],
        "specs": {
            "Brand": "Zolex",
            "Material": "Electrolytic Copper / Aluminium",
            "Plating": "Electro-Tin Plated",
            "Compliance": "DIN / IEC / IS Standards"
        },
        "industries": ["Power & Energy", "Industrial Automation", "Electrical Switchgear"],
        "featured": idx < 12,
        "image": img if img.startswith('http') or img.startswith('/') else '/logo.png',
        "inStock": True,
        "price": 120 + (idx % 25) * 15,
        "stockCount": 250,
        "unit": "pcs",
        "leadTime": "24-48 Hours",
        "externalUrl": link if link else "https://zolex.in/product/"
    })

# Add gauge lug & ferrule model variations
extra_count = len(zolex_expanded)
for g in gauge_sizes:
    for s in ["M6", "M8", "M10", "M12"]:
        extra_count += 1
        g_val = float(g)
        zolex_expanded.append({
            "id": f"zolex-var-{extra_count:03d}",
            "sku": f"ZOLEX-CU-{g}MM-{s}",
            "name": f"Zolex {g} mm² Copper Tube Crimping Lug ({s} Stud)",
            "brand": "Zolex",
            "category": "Copper Lugs & Connectors",
            "subCategory": "Copper Tube Crimping Lugs",
            "description": f"High conductivity ETP copper tube lug for {g} mm² cable with {s} stud hole size, electro-tin plated.",
            "features": ["Electrolytic ETP Copper 99.9%", "Inspection hole for wire insertion verification", "Tin plated anti-corrosion finish"],
            "specs": {"Cable Size": f"{g} mm²", "Stud Hole": s, "Material": "ETP Copper", "Plating": "Tin Plated"},
            "industries": ["Power & Energy", "Electrical Switchgear"],
            "featured": False,
            "image": "/logo.png",
            "inStock": True,
            "price": float(45 + int(g_val) * 3),
            "stockCount": 500,
            "unit": "pcs",
            "leadTime": "24-48 Hours"
        })

print(f"Total Amphenol products created: {len(amphenol_expanded)}")
print(f"Total Zolex products created: {len(zolex_expanded)}")

with open('scripts/expanded_catalog.json', 'w', encoding='utf-8') as f:
    json.dump({'amphenol': amphenol_expanded, 'zolex': zolex_expanded}, f, indent=2)

print("Saved expanded catalog!")
