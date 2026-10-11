with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(283, min(360, len(lines))):
    print(lines[i].encode('ascii', 'replace').decode('ascii'), end='')
