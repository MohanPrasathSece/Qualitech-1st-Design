import csv

with open('wc-product-export-5-9-2026-1788586014091.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        print(f"{i+1}. {row.get('SKU')} | {row.get('Name')} | {row.get('Categories')}")
