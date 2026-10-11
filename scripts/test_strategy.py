import urllib.request
import urllib.parse
import re
import requests
from bs4 import BeautifulSoup

digikey_folders = [
    "FCI%20Photos",
    "Amphenol%20Photos",
    "Amphenol%20Commercial%20Products%20Photos",
    "Amphenol%20Aerospace%20Photos",
    "Amphenol%20Industrial%20Operations%20Photos",
    "Amphenol%20Sine%20Systems%20Photos",
    "Amphenol%20FCI%20Photos",
]

def clean_part_number(raw_pn):
    # Remove parenthetical comments like (5559002) or (FCI)
    cleaned = re.sub(r'\(.*?\)', '', raw_pn).strip()
    return cleaned

def check_digikey_direct(pn):
    cleaned = clean_part_number(pn)
    for folder in digikey_folders:
        for ext in ['.jpg', '.JPG', '.png', '.PNG']:
            url = f"https://media.digikey.com/Photos/{folder}/{urllib.parse.quote(cleaned)}{ext}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        return url
            except:
                pass
    return None

def check_digipart(pn):
    cleaned = clean_part_number(pn)
    url = f"https://www.digipart.com/part/{urllib.parse.quote(cleaned)}"
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=8)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if any(x in src.lower() for x in ['digikey.com', 'farnell.com', 'mouser.com', 'onlinecomponents.com', 'parts']):
                    if not any(x in src.lower() for x in ['pdf-16', 'arrow', 'logo', 'flag', 'icon', 'distr']):
                        if src.startswith('//'):
                            return f"https:{src}"
                        return src
    except:
        pass
    return None

# Test on 15 products
import json
with open('scripts/parsed_qualitech_products.json', 'r', encoding='utf-8') as f:
    prods = json.load(f)

print(f"Testing first 20 products from catalog:")
for p in prods[:20]:
    sku = p['sku']
    found_url = check_digikey_direct(sku)
    source = "DigiKey CDN"
    if not found_url:
        found_url = check_digipart(sku)
        source = "Digipart"
    
    if found_url:
        print(f"SUCCESS [{source:12s}] {sku:25s} -> {found_url[:80]}")
    else:
        print(f"MISS                 {sku:25s}")
