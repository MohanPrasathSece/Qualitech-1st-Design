import json
import re
import os
import urllib.request

# Load expanded catalog
with open('scripts/expanded_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

amp_list = catalog['amphenol']
zol_list = catalog['zolex']
new_all = amp_list + zol_list

# Load current products.ts up to the end of Qualitech items
with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's keep existing Qualitech items in products.ts (which were updated to brand "Qualitech")
# We can find where export const PRODUCTS: Product[] = [ starts
products_start = text.find('export const PRODUCTS: Product[] = [')
header_part = text[:products_start + len('export const PRODUCTS: Product[] = [')]

# Let's extract existing products array
raw_array_str = text[products_start + len('export const PRODUCTS: Product[] = ['):]
closing_idx = raw_array_str.rfind('];')
products_body = raw_array_str[:closing_idx]

# Remove any previous amphenol/zolex additions if any were appended to clean up duplicates
# We split products by 'id:' or object boundaries
# Or we can filter out non-Qualitech items from the parsed TS string
# Let's clean up products_body to keep only items with brand: "Qualitech"

qualitech_objects = []
# Match each object { ... } in TS
raw_items = re.findall(r'\{\s*id:\s*[\x22\x27]([^\x22\x27]+)[\x22\x27].*?brand:\s*[\x22\x27]Qualitech[\x22\x27].*?\},', products_body, re.DOTALL)

print(f"Found {len(raw_items)} existing Qualitech product IDs in TS file.")

# Format new Amphenol & Zolex products into TS entries
ts_entries = []
for p in new_all:
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
    ts_entries.append(ts_obj)

# Keep only the Qualitech portion of products_body before the first appended Amphenol item
first_amp = products_body.find('id: "amp-')
if first_amp == -1:
    first_amp = products_body.find("id: 'amp-")
first_zol = products_body.find('id: "zolex-')
if first_zol == -1:
    first_zol = products_body.find("id: 'zolex-")

cut_off = len(products_body)
if first_amp != -1:
    cut_off = min(cut_off, first_amp)
if first_zol != -1:
    cut_off = min(cut_off, first_zol)

qualitech_ts_body = products_body[:cut_off].strip()
if not qualitech_ts_body.endswith(','):
    qualitech_ts_body += ','

new_full_ts = header_part + "\n" + qualitech_ts_body + "\n" + "\n".join(ts_entries) + "\n];\n"

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(new_full_ts)

print("Updated src/data/products.ts successfully!")

# Now sync with Supabase
SUPABASE_URL = 'https://xgttkvykqtoppbsfukzr.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs'

# Prepare Supabase rows
supabase_rows = []
for p in new_all:
    supabase_rows.append({
        "id": p["id"],
        "sku": p["sku"],
        "name": p["name"],
        "brand": p["brand"],
        "category": p["category"],
        "sub_category": p.get("subCategory", None),
        "description": p.get("description", ""),
        "features": p.get("features", []),
        "specs": p.get("specs", {}),
        "industries": p.get("industries", []),
        "featured": p.get("featured", False),
        "image": p.get("image", ""),
        "in_stock": p.get("inStock", True),
        "external_url": p.get("externalUrl", None),
        "price": p.get("price", 100),
        "stock_count": p.get("stockCount", 100),
        "unit": p.get("unit", "pcs"),
        "lead_time": p.get("leadTime", "24-48 Hours"),
        "datasheet_url": p.get("datasheetUrl", None)
    })

# Upsert in batches of 50
print(f"Upserting {len(supabase_rows)} products into Supabase REST API...")
for i in range(0, len(supabase_rows), 50):
    batch = supabase_rows[i:i+50]
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/products",
        data=json.dumps(batch).encode('utf-8'),
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Batch {i//50 + 1} synced! Status: {resp.status}")
    except Exception as e:
        print(f"Batch {i//50 + 1} error: {e}")

print("Supabase catalog sync complete!")
