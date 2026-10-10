import urllib.request
import ssl
from bs4 import BeautifulSoup
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://zolex.in/product/'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req, context=ctx, timeout=15).read().decode('utf-8', errors='ignore')

soup = BeautifulSoup(html, 'html.parser')

products_dict = {}

# Look for woocommerce / product cards
cards = soup.select('.product, li.product, div.product-grid-item, article')
for card in cards:
    link_el = card.select_one('a[href*="/product/"]')
    if not link_el:
        continue
    link = link_el['href']
    if link.endswith('/product/') or link.endswith('/product'):
        continue
    
    # Title
    title_el = card.select_one('.woocommerce-loop-product__title, .product-title, h2, h3, h4')
    title = title_el.text.strip() if title_el else link.rstrip('/').split('/')[-1].replace('-', ' ').title()
    
    # Image
    img_el = card.select_one('img')
    img = ''
    if img_el:
        img = img_el.get('src') or img_el.get('data-src') or img_el.get('srcset', '').split(' ')[0] or ''
    
    # Price if available
    price_el = card.select_one('.price')
    price = price_el.text.strip() if price_el else ''

    if link not in products_dict and title:
        products_dict[link] = {
            'name': title,
            'link': link,
            'image': img,
            'price': price,
            'brand': 'Zolex'
        }

print(f"Unique Zolex Products found: {len(products_dict)}")
for p in list(products_dict.values())[:30]:
    print(f"• {p['name']} | {p['link']}")

with open('scripts/zolex_products_scraped.json', 'w', encoding='utf-8') as f:
    json.dump(list(products_dict.values()), f, indent=2)
