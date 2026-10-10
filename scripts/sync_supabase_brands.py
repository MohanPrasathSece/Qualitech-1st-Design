import urllib.request
import urllib.parse
import json

SUPABASE_URL = "https://xgttkvykqtoppbsfukzr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndHRrdnlrcXRvcHBic2Z1a3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3MjcxNywiZXhwIjoyMTA0ODQ4NzE3fQ.iWnF2ZuGuO439mBXfWtLESKw7sxzTFDQGNkyhKZNFUs"

# First, let's update all products where brand == "Amphenol" currently in Supabase to brand = "Qualitech" (the 401 existing ones)
req_url = f"{SUPABASE_URL}/rest/v1/products?brand=eq.Amphenol"
req = urllib.request.Request(
    req_url,
    data=json.dumps({"brand": "Qualitech"}).encode('utf-8'),
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    },
    method="PATCH"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Updated existing Amphenol products in Supabase to Qualitech! Status:", resp.status)
except Exception as e:
    print("Error updating existing records:", e)

# Now, let's upload the new Amphenol products and Zolex products to Supabase
with open('scripts/generated_amphenol_zolex.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_prods = data['amphenol'] + data['zolex']

rows = []
for p in new_prods:
    rows.append({
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

print(f"Upserting {len(rows)} new Amphenol & Zolex rows into Supabase...")

req_upsert = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/products",
    data=json.dumps(rows).encode('utf-8'),
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req_upsert) as resp:
        print("Upserted Amphenol & Zolex products successfully! Status:", resp.status)
except Exception as e:
    print("Error upserting new products:", e)
