import csv
import json

with open('wc-product-export-5-9-2026-1788586014091.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

amphenol_items = []
zolex_items = []
qualitech_items = []

for r in rows:
    sku = r.get('SKU', '')
    name = r.get('Name', '')
    desc = r.get('Description', '') or r.get('Short description', '')
    cat = r.get('Categories', '')
    images = r.get('Images', '')
    
    item = {
        'sku': sku,
        'name': name,
        'description': desc,
        'category': cat,
        'images': images
    }
    
    if sku.startswith('AMPHENOL') or 'Amphenol' in sku or 'Amphenol' in name:
        item['brand'] = 'Amphenol'
        amphenol_items.append(item)
    elif sku.startswith('ZOLEX') or 'ZOLEX' in sku or 'Zolex' in name:
        item['brand'] = 'Zolex'
        zolex_items.append(item)
    else:
        item['brand'] = 'Qualitech'
        qualitech_items.append(item)

print(f"CSV counts -> Amphenol: {len(amphenol_items)}, Zolex: {len(zolex_items)}, Qualitech: {len(qualitech_items)}")

with open('scripts/csv_extracted.json', 'w', encoding='utf-8') as f:
    json.dump({'amphenol': amphenol_items, 'zolex': zolex_items, 'qualitech': qualitech_items}, f, indent=2)
