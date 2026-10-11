import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all comments like // --- ... ---
comments = re.findall(r'//\s*---\s*([^\n]+)\s*---', text)
print("Section comments in products.ts:")
for c in comments:
    print("  ", c)
