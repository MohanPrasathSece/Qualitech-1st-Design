import json
import re
import urllib.request
import urllib.parse

# 1. Load generated products
with open('scripts/generated_amphenol_zolex.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

amphenol_prods = data['amphenol']
zolex_prods = data['zolex']
all_new_prods = amphenol_prods + zolex_prods

print(f"Loaded {len(amphenol_prods)} Amphenol products and {len(zolex_prods)} Zolex products.")

# 2. Convert python objects to TypeScript object syntax
ts_entries = []
for p in all_new_prods:
    features_js = json.dumps(p.get('features', []))
    specs_js = json.dumps(p.get('specs', {}))
    industries_js = json.dumps(p.get('industries', []))
    
    ts_obj = f"""  {{
    id: {json.dumps(p['id'])},
    sku: {json.dumps(p['sku'])},
    name: {json.dumps(p['name'])},
    brand: {json.dumps(p['brand'])},
    category: {json.dumps(p['category'])},
    subCategory: {json.dumps(p.get('subCategory', ''))},
    description: {json.dumps(p.get('description', ''))},
    features: {features_js},
    specs: {specs_js},
    industries: {industries_js},
    featured: {str(p.get('featured', False)).lower()},
    image: {json.dumps(p.get('image', '/logo.png'))},
    inStock: {str(p.get('inStock', True)).lower()},
    price: {p.get('price', 100)},
    stockCount: {p.get('stockCount', 100)},
    unit: {json.dumps(p.get('unit', 'pcs'))},
    leadTime: {json.dumps(p.get('leadTime', '24-48 Hours'))},
    externalUrl: {json.dumps(p.get('externalUrl', ''))},
    datasheetUrl: {json.dumps(p.get('datasheetUrl', ''))}
  }},"""
    ts_entries.append(ts_obj)

new_ts_block = "\n" + "\n".join(ts_entries) + "\n"

# Read products.ts
with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the last occurrence of ];
closing_idx = content.rfind('];')
if closing_idx != -1:
    new_content = content[:closing_idx] + new_ts_block + content[closing_idx:]
    with open('src/data/products.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully appended {len(all_new_prods)} products to src/data/products.ts!")
else:
    print("Error: Could not find ]; in src/data/products.ts")
