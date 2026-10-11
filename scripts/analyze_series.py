import json
from collections import Counter
import re

with open('scripts/parsed_qualitech_products.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

print(f"Total Qualitech products: {len(prods)}")

# Analyze prefix / series patterns
prefixes = Counter()
for p in prods:
    sku = p['sku'].strip()
    # match leading alphanumeric prefix before hyphen or space
    m = re.match(r'^([A-Za-z0-9]+)', sku)
    if m:
        prefixes[m.group(1)] += 1

print("\nTop SKU prefixes / series:")
for k, v in prefixes.most_common(25):
    print(f"  {k:15s}: {v} products")
