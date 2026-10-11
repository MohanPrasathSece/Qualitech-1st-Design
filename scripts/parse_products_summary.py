import re
import json

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect products in PRODUCTS array
start_idx = text.find('export const PRODUCTS: Product[] = [')
products_str = text[start_idx:]

# Let's count products by brand and see images
# Let's parse each object
# A regex to match { sku: ... brand: ... image: ... }
# Or let's parse using a state machine or split on `{\n    sku:` or `{\n    id:`
chunks = re.split(r'\n  \{\n', products_str)
print(f"Total chunks: {len(chunks) - 1}")

products = []
for c in chunks[1:]:
    sku_m = re.search(r'sku:\s*["\']([^"\']+)["\']', c)
    name_m = re.search(r'name:\s*["\']([^"\']+)["\']', c)
    brand_m = re.search(r'brand:\s*["\']([^"\']+)["\']', c)
    category_m = re.search(r'category:\s*["\']([^"\']+)["\']', c)
    subcat_m = re.search(r'subCategory:\s*["\']([^"\']+)["\']', c)
    image_m = re.search(r'image:\s*([^\n,]+)', c)
    
    sku = sku_m.group(1) if sku_m else ''
    name = name_m.group(1) if name_m else ''
    brand = brand_m.group(1) if brand_m else ''
    category = category_m.group(1) if category_m else ''
    subcat = subcat_m.group(1) if subcat_m else ''
    image = image_m.group(1).strip().strip('"\'') if image_m else ''
    
    products.append({
        'sku': sku,
        'name': name,
        'brand': brand,
        'category': category,
        'subCategory': subcat,
        'image': image
    })

print(f"Total parsed products: {len(products)}")

by_brand = {}
for p in products:
    b = p['brand']
    if b not in by_brand:
        by_brand[b] = []
    by_brand[b].append(p)

for b, prods in by_brand.items():
    print(f"\nBrand: {b} (Total: {len(prods)})")
    has_image = [p for p in prods if p['image']]
    has_default_or_placeholder = [p for p in prods if p['image'] and ('placeholder' in p['image'].lower() or p['image'] in ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'cardCable', 'cardConnectors'])]
    has_url = [p for p in prods if p['image'].startswith('http')]
    has_local = [p for p in prods if p['image'].startswith('/')]
    print(f"  Has image entry: {len(has_image)}")
    print(f"  Placeholder/imported variable: {len(has_default_or_placeholder)}")
    print(f"  Http URLs: {len(has_url)}")
    print(f"  Local / paths: {len(has_local)}")
    print("  First 5 products:")
    for p in prods[:5]:
        print(f"    sku: {p['sku']} | name: {p['name']} | image: {p['image']}")

# Let's save a json of qualitech products
with open('scripts/parsed_qualitech_products.json', 'w', encoding='utf-8') as f:
    json.dump([p for p in products if p['brand'] == 'Qualitech'], f, indent=2)

print("\nSaved scripts/parsed_qualitech_products.json")
