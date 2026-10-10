import json
import re
import os

# Scraped Zolex products
with open('scripts/zolex_products_scraped.json', 'r', encoding='utf-8') as f:
    zolex_scraped = json.load(f)

# Amphenol product definitions
amphenol_products = [
    {
        "id": "amp-gnss-01",
        "sku": "AMPHENOL-GNSS-ANT-01",
        "name": "High Precision GNSS Multi-Band Active Patch Antenna (L1/L2/L5)",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Industrial grade high-precision GNSS active antenna supporting GPS, GLONASS, Galileo, and BeiDou frequencies (L1/L2/L5/E1/E5b) for RTK and centimeter-level positioning accuracy.",
        "features": [
            "Multi-band support: GPS L1/L2/L5, GLONASS G1/G2, Galileo E1/E5b, BeiDou B1/B2/B3",
            "High gain LNA (28dB - 38dB) with low noise figure (<1.5dB)",
            "IP67 / IP69K weatherproof enclosure with UV resistant casing",
            "Low power consumption for IoT and autonomous vehicle applications",
            "Pre-filtered high out-of-band rejection for cellular & Wi-Fi immunity"
        ],
        "specs": {
            "Frequency Range": "1164 - 1610 MHz",
            "Peak Gain": "38 dBi max",
            "Impedance": "50 Ohms",
            "VSWR": "< 1.5:1",
            "Operating Temp": "-40°C to +85°C",
            "Connector Type": "SMA Plug / TNC / FAURA",
            "Mounting Type": "Screw Mount / Magnetic Mount"
        },
        "industries": ["Autonomous Vehicles", "Precision Agriculture", "Surveying & Geodesy", "Telematics"],
        "featured": True,
        "image": "",
        "inStock": True,
        "price": 4850,
        "stockCount": 150,
        "unit": "pcs",
        "leadTime": "24-48 Hours",
        "datasheetUrl": "https://www.amphenol-cs.com/product-series/gnss.html"
    },
    {
        "id": "amp-gnss-02",
        "sku": "AMPHENOL-GNSS-FPC-02",
        "name": "Embedded Flexible FPC Dual-Band GNSS Antenna (L1/L5)",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Ultra-thin flexible printed circuit (FPC) internal antenna optimized for compact IoT devices, wearables, and asset trackers requiring precise GPS/GNSS location tracking.",
        "features": [
            "Dual-band L1 + L5 GNSS capability",
            "Flexible 3M adhesive backing for quick installation inside plastic housings",
            "Micro-coaxial cable assembly with IPEX MHF4 / U.FL connector",
            "Omnidirectional radiation pattern"
        ],
        "specs": {
            "Frequency": "1575.42 MHz & 1176.45 MHz",
            "Dimensions": "40 x 15 x 0.2 mm",
            "Impedance": "50 Ohms",
            "Efficiency": "> 65%",
            "Cable Length": "100mm micro-coax"
        },
        "industries": ["IoT & Smart City", "Asset Tracking", "Wearables"],
        "featured": False,
        "image": "",
        "inStock": True,
        "price": 1250,
        "stockCount": 300,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-gnss-03",
        "sku": "AMPHENOL-GNSS-EXT-03",
        "name": "Rugged Vehicle Dome GNSS + 5G + Wi-Fi 6E Combo Antenna",
        "brand": "Amphenol",
        "category": "Antennas",
        "subCategory": "High Precision GNSS Antennas",
        "description": "Heavy-duty 5-in-1 multi-purpose vehicle antenna featuring high-precision GNSS positioning, 2x2 MIMO 5G/4G LTE, and 2x2 MIMO Wi-Fi 6E for fleet telematics and emergency vehicles.",
        "features": [
            "5-in-1 integrated dome design: 1x GNSS, 2x 5G/4G, 2x Wi-Fi 6E",
            "High impact IK10 & IP69K waterproof rating",
            "Heavy-duty bolt mount through vehicle roof",
            "Low-loss RG58/LMR195 cable leads"
        ],
        "specs": {
            "GNSS Band": "GPS L1/L2, GLONASS, BeiDou, Galileo",
            "Cellular Band": "617 - 5925 MHz (5G NR Sub-6GHz)",
            "Wi-Fi Band": "2.4 GHz / 5 GHz / 6 GHz Dual-Band",
            "IP Rating": "IP67 / IP69K",
            "Operating Temp": "-40°C to +85°C"
        },
        "industries": ["Automotive", "Public Safety", "Fleet Telematics", "Robotics"],
        "featured": True,
        "image": "",
        "inStock": True,
        "price": 9200,
        "stockCount": 85,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-circ-01",
        "sku": "AMPHENOL-CIRC-MIL-38999",
        "name": "MIL-DTL-38999 Series III Circular Connectors",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Board to Board",
        "description": "High-density harsh environment circular connectors engineered for military aerospace and heavy industrial defense systems. Features triple-start thread coupling with anti-decoupling ratchet mechanism.",
        "features": [
            "Tri-start thread coupling mechanism",
            "100% scoop-proof contact design",
            "EMI shielding grounding fingers",
            "Operates up to 200°C severe thermal environments"
        ],
        "specs": {
            "Shell Size": "9 to 25",
            "Contact Count": "2 to 128 pins",
            "Plating": "Olive Drab Cadmium / Electroless Nickel / Black Zinc Nickel",
            "IP Rating": "IP67 / IP68"
        },
        "industries": ["Defense", "Aerospace", "Marine"],
        "featured": True,
        "image": "",
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
        "description": "Compact IP67 sealed M12 circular connectors for industrial automation, fieldbus systems, Single Pair Ethernet (SPE), and 10GbE High-Speed Industrial Ethernet.",
        "features": [
            "Available in A, B, D, K, L, S, T, and X coding",
            "Shielded metal housing for high EMI noise suppression",
            "Screw-lock and push-pull mating mechanisms"
        ],
        "specs": {
            "Pin Count": "3, 4, 5, 8, 12 pins",
            "Current Rating": "Up to 12A per contact",
            "Voltage": "250V",
            "IP Rating": "IP67 / IP68 sealed"
        },
        "industries": ["Industrial Automation", "Robotics", "Factory Automation"],
        "featured": False,
        "image": "",
        "inStock": True,
        "price": 1450,
        "stockCount": 450,
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
        "features": [
            "Stamped and formed or machined precision pin contacts",
            "Steel shell with tin plating for grounding continuity",
            "UL94V-0 high temperature thermoplastic insulator"
        ],
        "specs": {
            "Positions": "9, 15, 25, 37, 50 pin",
            "Current Rating": "5A per pin",
            "Dielectric Withstanding": "1000V AC"
        },
        "industries": ["Telecommunications", "Industrial Automation", "Medical Equipment"],
        "featured": False,
        "image": "",
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
        "features": [
            "Low insertion force with high contact surface area",
            "Handles continuous currents from 35A up to 1000A",
            "Up to 40% more current capacity than standard pin/socket contacts"
        ],
        "specs": {
            "Contact Sizes": "2.4mm to 14mm RADSOK pins",
            "Current Rating": "70A to 1000A",
            "Temperature Rise": "< 30°C at full rated load"
        },
        "industries": ["Power & Energy", "EV Charging", "Data Centers", "Heavy Industrial"],
        "featured": True,
        "image": "",
        "inStock": True,
        "price": 3400,
        "stockCount": 210,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-rf-01",
        "sku": "AMPHENOL-RF-CONN-SMA",
        "name": "Precision RF Coaxial Connectors (SMA / BNC / N-Type / TNC)",
        "brand": "Amphenol",
        "category": "Connectors",
        "subCategory": "Input / Output (I/O)",
        "description": "High performance 50 Ohm precision RF coaxial connectors engineered for microwave, telecommunications test equipment, and high-frequency wireless communications.",
        "features": [
            "DC to 18 GHz frequency bandwidth (SMA / N-Type)",
            "Gold-plated center conductor contacts for minimal reflection",
            "Threaded coupling for vibration-proof reliability"
        ],
        "specs": {
            "Impedance": "50 Ohms",
            "Frequency Range": "DC - 18 GHz",
            "VSWR": "< 1.15:1 up to 12 GHz",
            "Durability": "500 mating cycles min"
        },
        "industries": ["Telecommunications", "Test & Measurement", "Defense"],
        "featured": False,
        "image": "",
        "inStock": True,
        "price": 620,
        "stockCount": 600,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    },
    {
        "id": "amp-fo-01",
        "sku": "AMPHENOL-FO-PATCH-LC-SC",
        "name": "Fiber Optic Connectors & Optical Patch Cords (LC / SC / MPO)",
        "brand": "Amphenol",
        "category": "Fiber Optics",
        "subCategory": "Fiber Optic Connectors & Patch Cords",
        "description": "Single-mode OS2 and multi-mode OM3/OM4 optical fiber patch cables equipped with low loss ceramic ferrule LC, SC, and MPO/MTP connectors.",
        "features": [
            "Ultra low insertion loss (< 0.15 dB)",
            "100% factory tested and end-face geometry inspected",
            "LSZH flame-retardant outer jacket"
        ],
        "specs": {
            "Fiber Type": "Single-Mode OS2 (9/125um) / Multi-Mode OM4",
            "Insertion Loss": "< 0.2 dB",
            "Return Loss": "> 60 dB (APC)",
            "Cable Lengths": "1m, 3m, 5m, 10m, 25m"
        },
        "industries": ["Telecommunications", "Data Centers", "Broadcast"],
        "featured": True,
        "image": "",
        "inStock": True,
        "price": 1850,
        "stockCount": 320,
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
        "features": [
            "Integrated HVIL (High Voltage Interlock Loop) safety feature",
            "360° EMI shielding against electromagnetic interference",
            "Push-lock double-stage latching for vibration protection",
            "IP67 / IP6K9K touch-proof IP2X protection"
        ],
        "specs": {
            "Rated Voltage": "1000V DC",
            "Current Rating": "Up to 250A continuous",
            "Wire Range": "25mm² to 50mm² HV cable",
            "IP Rating": "IP67 / IP6K9K"
        },
        "industries": ["Automotive", "EV Charging", "Power & Energy"],
        "featured": True,
        "image": "",
        "inStock": True,
        "price": 5400,
        "stockCount": 140,
        "unit": "pcs",
        "leadTime": "24-48 Hours"
    }
]

print(f"Defined {len(amphenol_products)} detailed Amphenol products (including GNSS).")

# Now let's transform scraped Zolex products into standard Product schema objects
zolex_products = []
for idx, z in enumerate(zolex_scraped):
    name = z.get('name', 'Zolex Product').strip()
    link = z.get('link', '')
    img = z.get('image', '') or ''
    
    # Categorize Zolex item
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

    sku_slug = re.sub(r'[^A-Z0-9]', '-', name.upper())[:30].strip('-')
    
    prod = {
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
        "featured": idx < 8,
        "image": img if img.startswith('http') or img.startswith('/') else '',
        "inStock": True,
        "price": 120 + (idx % 25) * 15,
        "stockCount": 250,
        "unit": "pcs",
        "leadTime": "24-48 Hours",
        "externalUrl": link if link else "https://zolex.in/product/"
    }
    zolex_products.append(prod)

print(f"Generated {len(zolex_products)} Zolex products from scraped data.")

with open('scripts/generated_amphenol_zolex.json', 'w', encoding='utf-8') as f:
    json.dump({'amphenol': amphenol_products, 'zolex': zolex_products}, f, indent=2)

print("Saved amphenol and zolex JSON definitions!")
