import json
import re

# Read src/data/products.ts
with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Load expanded catalog
with open('scripts/expanded_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

amp_list = catalog['amphenol']
zol_list = catalog['zolex']

# Let's rebuild products.ts cleanly:
# 1. Header imports & interfaces (everything up to export const PRODUCTS: Product[] = [)
products_start = text.find('export const PRODUCTS: Product[] = [')
header_part = text[:products_start + len('export const PRODUCTS: Product[] = [')]

# 2. Extract existing Qualitech items string
raw_array_str = text[products_start + len('export const PRODUCTS: Product[] = ['):]

# Remove any appended Amphenol or Zolex blocks from raw_array_str to get pure Qualitech items
first_amp = raw_array_str.find('id: "amp-')
if first_amp == -1: first_amp = raw_array_str.find("id: 'amp-")

first_zol = raw_array_str.find('id: "zolex-')
if first_zol == -1: first_zol = raw_array_str.find("id: 'zolex-")

cut_off = raw_array_str.rfind('];')
if first_amp != -1: cut_off = min(cut_off, first_amp)
if first_zol != -1: cut_off = min(cut_off, first_zol)

qualitech_part = raw_array_str[:cut_off].strip()
if not qualitech_part.endswith(','):
    qualitech_part += ','

# 3. Format Amphenol items
amp_ts_entries = []
for p in amp_list:
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
    image: {json.dumps(p.get('image', ''))},
    inStock: {str(p.get('inStock', True)).lower()},
    price: {p.get('price', 100)},
    stockCount: {p.get('stockCount', 100)},
    unit: {json.dumps(p.get('unit', 'pcs'))},
    leadTime: {json.dumps(p.get('leadTime', '24-48 Hours'))},
    externalUrl: {json.dumps(p.get('externalUrl', ''))},
    datasheetUrl: {json.dumps(p.get('datasheetUrl', ''))}
  }},"""
    amp_ts_entries.append(ts_obj)

# 4. Format Zolex items
zol_ts_entries = []
for p in zol_list:
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
    image: {json.dumps(p.get('image', ''))},
    inStock: {str(p.get('inStock', True)).lower()},
    price: {p.get('price', 100)},
    stockCount: {p.get('stockCount', 100)},
    unit: {json.dumps(p.get('unit', 'pcs'))},
    leadTime: {json.dumps(p.get('leadTime', '24-48 Hours'))},
    externalUrl: {json.dumps(p.get('externalUrl', ''))},
    datasheetUrl: {json.dumps(p.get('datasheetUrl', ''))}
  }},"""
    zol_ts_entries.append(ts_obj)

# Combine: 1) Qualitech 2) Amphenol 3) Zolex
new_products_ts = header_part + "\n" + qualitech_part + "\n" + "\n".join(amp_ts_entries) + "\n" + "\n".join(zol_ts_entries) + "\n];\n"

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(new_products_ts)

print("Successfully ordered products in products.ts: Qualitech -> Amphenol -> Zolex!")
