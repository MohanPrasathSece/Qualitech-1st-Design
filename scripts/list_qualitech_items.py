import json

with open('scripts/parsed_qualitech_products.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

print(f"Total Qualitech products: {len(prods)}")
for i, p in enumerate(prods[:25]):
    print(f"{i+1:3d}. SKU: {p['sku']:30s} | Name: {p['name']:30s} | Category: {p['category']}")
