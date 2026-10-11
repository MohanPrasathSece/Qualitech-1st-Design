import urllib.request
import urllib.parse
import re
import requests
from bs4 import BeautifulSoup

def strip_lf(sku):
    s = re.sub(r'\(.*?\)', '', sku).strip()
    s_clean = re.sub(r'(?:U?LF|TLF|RLF|GLF|ALF|E1LF)$', '', s)
    return s, s_clean

test_skus = [
    "10078995-G01-30ULF",
    "10131936-120ULF",
    "10132450-0221GLF",
    "10135551-142310LF",
    "10135554-143010LF",
    "10138980-0411LF",
    "10159684-04GLF",
    "67094-002LF",
    "67096-002LF",
    "86130142114345E1LF",
    "861400361Y01LF",
    "DA15S564TILF",
    "DE09S064TILF",
    "76624-001LF",
]

for sku in test_skus:
    raw, stripped = strip_lf(sku)
    print(f"\nTesting SKU: {sku} -> stripped: {stripped}")
    
    # Try DigiKey CDN with both raw and stripped
    found = False
    for name in [raw, stripped]:
        for folder in ["FCI%20Photos", "Amphenol%20Photos", "Amphenol%20Commercial%20Products%20Photos", "Amphenol%20Industrial%20Operations%20Photos"]:
            for ext in ['.jpg', '.JPG']:
                u = f"https://media.digikey.com/Photos/{folder}/{urllib.parse.quote(name)}{ext}"
                try:
                    r = requests.head(u, headers={'User-Agent': 'Mozilla/5.0'}, timeout=2)
                    if r.status_code == 200:
                        print(f"  FOUND on DigiKey CDN: {u}")
                        found = True
                        break
                except:
                    pass
            if found:
                break
        if found:
            break
            
    # Try Digipart with both
    if not found:
        for name in [raw, stripped]:
            url = f"https://www.digipart.com/part/{urllib.parse.quote(name)}"
            try:
                r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=4)
                soup = BeautifulSoup(r.text, 'html.parser')
                imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
                cand = [i for i in imgs if any(x in i.lower() for x in ['digikey', 'farnell', 'mouser', 'onlinecomponents', 'photos', 'parts']) and not any(x in i.lower() for x in ['pdf', 'arrow', 'logo', 'flag', 'icon', 'distr'])]
                if cand:
                    print(f"  FOUND on Digipart ({name}): {cand[0]}")
                    found = True
                    break
            except:
                pass
                
    if not found:
        print(f"  NOT FOUND")
