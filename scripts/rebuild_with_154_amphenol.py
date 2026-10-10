import json
import re
import urllib.request

# Load 154 Amphenol products
with open('scripts/full_amphenol_products_154.json', 'r', encoding='utf-8') as f:
    amp_products = json.load(f)

with open('scripts/amphenol_tree.json', 'r', encoding='utf-8') as f:
    amp_tree = json.load(f)

with open('scripts/expanded_catalog.json', 'r', encoding='utf-8') as f:
    zol_products = json.load(f)['zolex']

# Read current products.ts
with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

tree_end = text.find('export const ALL_INDUSTRIES = [')
header_part = text[:text.find('export const BRAND_CATALOGUE_TREE: BrandCategoryTree[] = [')]

new_tree_str = f"""export const BRAND_CATALOGUE_TREE: BrandCategoryTree[] = [
  {{
    brand: "Amphenol",
    categories: {json.dumps(amp_tree, indent=6)}
  }},
  {{
    brand: "Zolex",
    categories: [
      {{
        name: "Crimp Terminals",
        subCategories: [
          "Ring Type Terminals",
          "Fork Type Terminals",
          "Pin Type Terminals",
          "End Sleeves (Bootlace Ferrules)",
          "Copper Reducer Terminal Ends"
        ]
      }},
      {{
        name: "Copper Lugs & Connectors",
        subCategories: [
          "Copper Tube Crimping Lugs",
          "Heavy Duty & Special Palm Lugs",
          "Angled Copper Lugs",
          "Through Connectors & Butt Links",
          "DIN & Australian Standard Lugs",
          "Copper T-Connectors"
        ]
      }},
      {{
        name: "Aluminium Lugs & Connectors",
        subCategories: [
          "Aluminium Tube Crimping Lugs",
          "Aluminium Through Connectors",
          "Aluminium Solid Crimping Lugs (DIN)",
          "Aluminium 3 & 4 Core Sector Lugs"
        ]
      }},
      {{
        name: "Bimetallic Lugs & Connectors",
        subCategories: [
          "Bimetallic Crimping Lugs (Al/Cu)",
          "Narrow Palm Bimetallic Lugs",
          "Bimetallic Reducing Links",
          "Bimetallic Stalk Lugs"
        ]
      }},
      {{
        name: "SS Cable Ties",
        subCategories: [
          "Roller Ball Lock Ties (Coated & Uncoated)",
          "Ladder Type SS Cable Ties",
          "Releasable SS Cable Ties",
          "Marker Tags, Straps & Buckles"
        ]
      }},
      {{
        name: "Cable Glands & Accessories",
        subCategories: [
          "Industrial Cable Glands (A2, BW, CW, E1W, A2F)",
          "Double Compression Flameproof Glands",
          "Single Compression & Marine Glands",
          "IP68 Polyamide Glands",
          "Gland Accessories (PVC Shrouds, Earth Tags, Lock Nuts, Reducers)"
        ]
      }},
      {{
        name: "Earthing Accessories",
        subCategories: [
          "Copper Bonded & Pure Copper Earth Rods",
          "Earth Clamps (Type A, Type G, Type C, Split Type B, U-Bolt)",
          "Air Terminal Lightning Protection & Multiple Points",
          "Earth Plates, Tape Clips & Saddles"
        ]
      }},
      {{
        name: "Tools",
        subCategories: [
          "SS Cable Tie Tensioning & Cutting Gun",
          "Band Strap Tensioning & Cutting Tool"
        ]
      }}
    ]
  }},
  {{
    brand: "Qualitech",
    categories: [
      {{
        name: "Custom Cable Assemblies",
        subCategories: [
          "Custom Wire Harnesses",
          "Ribbon Cable Assemblies",
          "RF Coaxial Cable Assemblies",
          "Heavy Duty Power Harnesses",
          "Defense & Military Cable Assemblies",
          "Turnkey OEM Solutions"
        ]
      }}
    ]
  }}
];

"""

middle_part = text[tree_end:text.find('export const PRODUCTS: Product[] = [') + len('export const PRODUCTS: Product[] = [')]

# Extract pure Qualitech products portion from existing PRODUCTS array
products_body = text[text.find('export const PRODUCTS: Product[] = [') + len('export const PRODUCTS: Product[] = ['):text.rfind('];')]

first_amp = products_body.find('id: "amp-')
if first_amp == -1: first_amp = products_body.find("id: 'amp-")

first_zol = products_body.find('id: "zolex-')
if first_zol == -1: first_zol = products_body.find("id: 'zolex-")

cut_off = len(products_body)
if first_amp != -1: cut_off = min(cut_off, first_amp)
if first_zol != -1: cut_off = min(cut_off, first_zol)

qualitech_pure = products_body[:cut_off].strip()
if not qualitech_pure.endswith(','):
    qualitech_pure += ','

# Format Amphenol TS entries
amp_ts_entries = []
for p in amp_products:
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
    amp_ts_entries.append(ts_obj)

# Format Zolex TS entries
zol_ts_entries = []
for p in zol_products:
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
    zol_ts_entries.append(ts_obj)

new_full_ts = header_part + new_tree_str + middle_part + "\n" + qualitech_pure + "\n" + "\n".join(amp_ts_entries) + "\n" + "\n".join(zol_ts_entries) + "\n];\n"

# Clean syntax double-braces if any
new_full_ts = re.sub(r'\},[\s\n]*\{,', '},\n  {', new_full_ts)

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(new_full_ts)

print("Updated products.ts with 154 Amphenol products!")

# Now sync with Supabase REST API
SUPABASE_URL = 'https://xgttkvykqtoppbsfukzr.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs'

supabase_rows = []
for p in amp_products:
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
        "image": p.get("image", "/logo.png"),
        "in_stock": p.get("inStock", True),
        "external_url": p.get("externalUrl", None),
        "price": p.get("price", 100),
        "stock_count": p.get("stockCount", 100),
        "unit": p.get("unit", "pcs"),
        "lead_time": p.get("leadTime", "24-48 Hours"),
        "datasheet_url": p.get("datasheetUrl", None)
    })

print(f"Upserting {len(supabase_rows)} Amphenol products into Supabase REST API...")
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

print("Supabase sync complete!")
