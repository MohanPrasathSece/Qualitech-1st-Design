import csv

with open('wc-product-export-5-9-2026-1788586014091.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for r in reader:
        btn = r.get('Button text') or ''
        if 'qualitech' in btn:
            print(f"SKU: {r.get('SKU')} | Name: {r.get('Name')} | URL: {btn}")
