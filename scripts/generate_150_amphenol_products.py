import json
import re
import urllib.request

with open('scripts/amphenol_tree.json', 'r', encoding='utf-8') as f:
    amp_tree = json.load(f)

amphenol_products = []
item_id_counter = 1

image_pool = [
    "/logo.png",
    "/logo.png",
    "/logo.png",
    "/logo.png"
]

for cat_obj in amp_tree:
    cat_name = cat_obj["name"]
    for sub in cat_obj["subCategories"]:
        slug = re.sub(r'[^A-Z0-9]', '-', sub.upper()).strip('-')[:25]
        
        # Create 2 distinct Amphenol products per subcategory
        for count in range(1, 3):
            sku = f"AMP-{slug}-{count:02d}-{item_id_counter:03d}"
            name = f"Amphenol {sub} {count:02d} - {slug} Series Part #{item_id_counter + 1000}"
            desc = f"Amphenol high performance {sub.lower()} (Variant {count}) engineered for demanding applications requiring reliable signal, power, or data transmission."
            
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
                    "Fully compliant with RoHS, REACH and UL94V-0 industry standards",
                    "100% factory tested and quality assured"
                ],
                "specs": {
                    "Manufacturer": "Amphenol Communication Solutions",
                    "Subcategory": sub,
                    "Variant": f"Option {count}",
                    "Operating Temp": "-40°C to +105°C",
                    "Compliance": "RoHS / REACH / UL94V-0"
                },
                "industries": ["Data Centers", "Telecommunications", "Industrial Automation", "Automotive", "Defense"],
                "featured": (item_id_counter % 5 == 0),
                "image": image_pool[(item_id_counter - 1) % len(image_pool)],
                "inStock": True,
                "price": 350 + (item_id_counter % 40) * 65,
                "stockCount": 150 + (item_id_counter % 12) * 25,
                "unit": "pcs",
                "leadTime": "24-48 Hours",
                "datasheetUrl": "https://www.amphenol-cs.com/"
            }
            amphenol_products.append(p)
            item_id_counter += 1

print(f"Generated {len(amphenol_products)} Amphenol products across 77 subcategories!")

with open('scripts/full_amphenol_products_154.json', 'w', encoding='utf-8') as f:
    json.dump(amphenol_products, f, indent=2)
