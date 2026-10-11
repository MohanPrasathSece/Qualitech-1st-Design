import re
import os

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's split by regex matching each product object: { id: ...
# Each product in products.ts typically starts with { \n id: or similar
blocks = re.split(r'\n\s*\{\s*\n?\s*id:\s*', text)
print(f"Total blocks detected: {len(blocks) - 1}")

qualitech_prods = []
for b in blocks[1:]:
    brand_m = re.search(r'brand:\s*["\']([^"\']+)["\']', b)
    brand = brand_m.group(1) if brand_m else ''
    if brand == 'Qualitech':
        name_m = re.search(r'name:\s*["\']([^"\']+)["\']', b)
        part_m = re.search(r'partNumber:\s*["\']([^"\']+)["\']', b)
        img_m = re.search(r'image:\s*["\']([^"\']+)["\']', b)
        cat_m = re.search(r'category:\s*["\']([^"\']+)["\']', b)
        subcat_m = re.search(r'subcategory:\s*["\']([^"\']+)["\']', b)
        
        qualitech_prods.append({
            'name': name_m.group(1) if name_m else '',
            'partNumber': part_m.group(1) if part_m else '',
            'category': cat_m.group(1) if cat_m else '',
            'subcategory': subcat_m.group(1) if subcat_m else '',
            'image': img_m.group(1) if img_m else None
        })

print(f"Total Qualitech products: {len(qualitech_prods)}")
with_img = [p for p in qualitech_prods if p['image']]
without_img = [p for p in qualitech_prods if not p['image']]
print(f"With image: {len(with_img)}")
print(f"Without image: {len(without_img)}")

print("\nFirst 10 WITH image:")
for p in with_img[:10]:
    print(f"  PN: {p['partNumber']} | Name: {p['name']} | Img: {p['image']}")

print("\nFirst 10 WITHOUT image:")
for p in without_img[:10]:
    print(f"  PN: {p['partNumber']} | Name: {p['name']} | Cat: {p['category']} / {p['subcategory']}")
