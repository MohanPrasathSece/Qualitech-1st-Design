import csv
import re

with open('wc-product-export-5-9-2026-1788586014091.csv', mode='r', encoding='utf-8-sig') as f:
    text = f.read()

urls = re.findall(r'https?://[^\s,"\'<>]+', text)
print(f"Total URLs found in CSV: {len(urls)}")
domains = set()
for u in urls:
    m = re.match(r'https?://([^/]+)', u)
    if m:
        domains.add(m.group(1))

print("Domains:")
for d in domains:
    print("  ", d)

print("\nSample URLs:")
for u in urls[:10]:
    print("  ", u)
