import json
import re
import urllib.request

# Complete Amphenol Category & Subcategory Definition matching the user's prompt
amphenol_tree = [
    {
        "name": "Connectors",
        "subCategories": [
            "Board-to-Board Connectors",
            "Wire-to-Board Connectors",
            "Wire-to-Wire Connectors",
            "Input / Output Connectors",
            "Power Connectors",
            "Card Edge Connectors",
            "Backplane Connectors",
            "Signal Connectors",
            "High-Speed I/O Connectors",
            "D-Subminiature Connectors",
            "DisplayPort Connectors",
            "HDMI Connectors",
            "USB Connectors",
            "PCIe Connectors",
            "Automotive Connectors",
            "Battery Connectors",
            "Memory & Media Connectors",
            "Modular Jacks",
            "Coaxial & RF Connectors",
            "Waterproof Connectors",
            "Fan Connectors",
            "IC Sockets",
            "Contacts & Terminals"
        ]
    },
    {
        "name": "Cables & Cable Assemblies",
        "subCategories": [
            "Active Optical Cables (AOC)",
            "Active Copper Cables (ACC)",
            "Active Electrical Cables (AEC)",
            "Direct Attach Copper Cables (DAC)",
            "OverPass Cable Assemblies",
            "Ethernet Cable Solutions",
            "PCIe Cables",
            "High-Speed I/O Cables",
            "Industrial Ethernet Cables",
            "Flex Cable Assemblies",
            "Crimp-to-Wire Cable Assemblies",
            "D-Sub Cable Assemblies",
            "Card Edge Cable Assemblies",
            "Power Cable Assemblies",
            "USB Cable Assemblies",
            "Modular Jack Cables",
            "IDC Solutions",
            "Commercial Rugged Cable Assemblies",
            "Custom Cable Assemblies"
        ]
    },
    {
        "name": "Fiber Optics",
        "subCategories": [
            "Optical Transceivers",
            "Fiber Optic Modules",
            "Active Optical Cables (AOC)",
            "Optical Connectivity Solutions",
            "High-Speed Optical Solutions",
            "Data Center Optical Solutions",
            "Custom Optical Solutions"
        ]
    },
    {
        "name": "Antennas",
        "subCategories": [
            "Embedded Antennas",
            "Internal Antennas",
            "External Antennas",
            "Combo / Multi-Purpose Antennas",
            "NFC Antennas",
            "GNSS Antennas",
            "Cellular Antennas",
            "Wi-Fi Antennas",
            "Bluetooth Antennas",
            "RF Antennas",
            "Custom Antenna Solutions"
        ]
    },
    {
        "name": "High-Speed I/O Solutions",
        "subCategories": [
            "High-Speed I/O Connectors",
            "High-Speed Cable Assemblies",
            "PCIe Solutions",
            "Ethernet Solutions",
            "InfiniBand Solutions",
            "NVLink Solutions",
            "Optical Interconnects",
            "Copper Interconnects",
            "Data Center Connectivity"
        ]
    },
    {
        "name": "Power Solutions",
        "subCategories": [
            "Power Supply Connectors",
            "Power Backplane Connectors",
            "Busbar I/O",
            "AC & DC Power",
            "Two-Piece Blade Connectors",
            "Pin & Socket Connectors",
            "Custom Power Solutions",
            "High-Voltage Connectors"
        ]
    }
]

# Generate detailed products for every Amphenol subcategory
amphenol_products = []
item_id_counter = 1

# List of assets for high quality images
image_pool = [
    "",
    "",
    "",
    ""
]

for cat_obj in amphenol_tree:
    cat_name = cat_obj["name"]
    for sub in cat_obj["subCategories"]:
        slug = re.sub(r'[^A-Z0-9]', '-', sub.upper()).strip('-')[:25]
        
        # Create 1-2 realistic Amphenol products per subcategory
        for count in range(1, 2):
            sku = f"AMP-{slug}-{item_id_counter:03d}"
            name = f"Amphenol {sub} - {slug} Series Part #{item_id_counter + 1000}"
            desc = f"Amphenol high performance {sub.lower()} designed for demanding applications requiring reliable signal, power, or data transmission."
            
            p = {
                "id": f"amp-full-{item_id_counter:03d}",
                "sku": sku,
                "name": name,
                "brand": "Amphenol",
                "category": cat_name,
                "subCategory": sub,
                "description": desc,
                "features": [
                    "Precision engineered to Amphenol global quality standards",
                    "High reliability design for harsh electrical and thermal environments",
                    "Fully compliant with RoHS and industry standards",
                    "100% factory tested and quality assured"
                ],
                "specs": {
                    "Manufacturer": "Amphenol Communication Solutions",
                    "Subcategory": sub,
                    "Operating Temp": "-40°C to +105°C",
                    "Compliance": "RoHS / REACH / UL94V-0"
                },
                "industries": ["Data Centers", "Telecommunications", "Industrial Automation", "Automotive", "Defense"],
                "featured": (item_id_counter % 7 == 0),
                "image": image_pool[(item_id_counter - 1) % len(image_pool)],
                "inStock": True,
                "price": 450 + (item_id_counter % 35) * 80,
                "stockCount": 150 + (item_id_counter % 10) * 20,
                "unit": "pcs",
                "leadTime": "24-48 Hours",
                "datasheetUrl": "https://www.amphenol-cs.com/"
            }
            amphenol_products.append(p)
            item_id_counter += 1

print(f"Generated {len(amphenol_products)} comprehensive Amphenol products covering all 77 subcategories!")

with open('scripts/full_amphenol_products.json', 'w', encoding='utf-8') as f:
    json.dump(amphenol_products, f, indent=2)

with open('scripts/amphenol_tree.json', 'w', encoding='utf-8') as f:
    json.dump(amphenol_tree, f, indent=2)
