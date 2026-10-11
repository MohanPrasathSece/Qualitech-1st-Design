import json
import os
from collections import Counter

with open('scripts/parsed_qualitech_products.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

existing_files = os.listdir('public/images/products/qualitech')
existing_skus = set(f.replace('.jpg', '').replace('.png', '') for f in existing_files)

missing = []
for p in prods:
    sku = p['sku']
    if sku not in existing_skus and not any(sku in f for f in existing_files):
        missing.append(p)

print(f"Total missing products: {len(missing)}")

# Analyze categories and series of missing products
cat_counts = Counter(f"{m['category']} > {m.get('subCategory', '')}" for m in missing)
print("\nMissing by Category:")
for cat, count in cat_counts.most_common(10):
    print(f"  {cat:40s}: {count}")

print("\nSample 25 missing SKUs:")
for m in missing[:25]:
    print(f"  SKU: {m['sku']:30s} | Category: {m['category']:15s} | Name: {m['name'][:40]}")
