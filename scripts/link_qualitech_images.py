#!/usr/bin/env python3
"""
Qualitech Product Image Linker
Links all Qualitech products in src/data/products.ts to their downloaded / populated
images in /images/products/qualitech/<sku>.jpg
"""

import os
import re
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PRODUCTS_TS = os.path.join(BASE_DIR, "src", "data", "products.ts")
IMG_DIR = os.path.join(BASE_DIR, "public", "images", "products", "qualitech")

def clean_pn(raw):
    return re.sub(r'\(.*?\)', '', raw).strip()

def safe_filename(pn):
    return re.sub(r'[^a-zA-Z0-9_\-\.]', '_', pn).strip('_')

def main():
    print()
    print("=" * 60)
    print("  Qualitech Product Image Linker")
    print("=" * 60)
    print()

    if not os.path.exists(PRODUCTS_TS):
        print(f"Error: {PRODUCTS_TS} not found")
        sys.exit(1)

    existing_images = set(os.listdir(IMG_DIR)) if os.path.exists(IMG_DIR) else set()

    with open(PRODUCTS_TS, 'r', encoding='utf-8') as f:
        content = f.read()

    count = 0

    # Match each top-level product object in products.ts:
    # starts with '  {\n    id:' and ends with '  },'
    pattern = re.compile(r'(\s*\{\s*\n\s*id:[^\n]+\n.*?brand:\s*["\']Qualitech["\'].*?\n\s*\},)', re.DOTALL)

    def replace_block(match):
        nonlocal count
        block = match.group(1)
        sku_m = re.search(r'sku:\s*["\']([^"\']+)["\']', block)
        if not sku_m:
            return block

        sku = sku_m.group(1)
        pn = clean_pn(sku)
        fname = safe_filename(pn) + ".jpg"

        # Check photoshoot files for custom cables
        if sku.upper().startswith("QT-"):
            for f in existing_images:
                if f.lower().startswith(sku.lower()):
                    fname = f
                    break

        img_url = f"/images/products/qualitech/{fname}"

        # Replace image property: e.g. image: p1, or image: "..." -> image: "/images/products/qualitech/..."
        new_block = re.sub(r'(image:\s*)[^,\n]+', rf'\1"{img_url}"', block)
        count += 1
        return new_block

    new_content = pattern.sub(replace_block, content)

    if count > 0:
        with open(PRODUCTS_TS, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  [OK] Successfully linked {count} Qualitech products to their images!")
        print(f"  Updated: {PRODUCTS_TS}")
    else:
        print("  Notice: No matching Qualitech products found to update.")

    print("=" * 60)
    print()

if __name__ == "__main__":
    main()
