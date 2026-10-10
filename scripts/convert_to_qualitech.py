import json
import re
import os
import urllib.request
import urllib.parse

# 1. Parse scraped Zolex products
zolex_scraped = []
if os.path.exists('scripts/zolex_products_scraped.json'):
    with open('scripts/zolex_products_scraped.json', 'r', encoding='utf-8') as f:
        zolex_scraped = json.load(f)

# 2. Parse CSV extracted products
csv_data = {}
if os.path.exists('scripts/csv_extracted.json'):
    with open('scripts/csv_extracted.json', 'r', encoding='utf-8') as f:
        csv_data = json.load(f)

# 3. Read current src/data/products.ts
with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    products_ts = f.read()

# Let's extract existing products array from products.ts
# We want to change the 401 existing products to brand: "Qualitech"
# We can do a string replacement for existing products in products.ts or extract them via regex!

# Let's parse existing products from products.ts
print("Processing existing products in products.ts...")

# Replace brand: "Amphenol" with brand: "Qualitech" for existing 401 products in products.ts text
updated_ts = re.sub(r'brand:\s*[\x22\x27]Amphenol[\x22\x27]', 'brand: "Qualitech"', products_ts)

# Let's check how many Qualitech products are in updated_ts now
qualitech_count = len(re.findall(r'brand:\s*[\x22\x27]Qualitech[\x22\x27]', updated_ts))
print(f"Updated existing products to Qualitech brand. Count: {qualitech_count}")

# Save updated products.ts initially
with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(updated_ts)

print("Saved updated brand to src/data/products.ts")
