import os
import re
import json
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = os.path.abspath("public/images/products/qualitech")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

def clean_part_number(raw_pn):
    cleaned = re.sub(r'\(.*?\)', '', raw_pn).strip()
    return cleaned

def safe_filename(pn):
    # Safe filename for Windows
    s = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', pn)
    return s.strip('_')

def find_image_url(pn):
    cleaned = clean_part_number(pn)
    clean_encoded = urllib.parse.quote(cleaned)
    
    # 1. Direct DigiKey FCI Photos check (very fast direct head/get)
    for ext in ['.jpg', '.JPG']:
        url = f"https://media.digikey.com/Photos/FCI%20Photos/{clean_encoded}{ext}"
        try:
            r = requests.head(url, headers=HEADERS, timeout=3, allow_redirects=True)
            if r.status_code == 200:
                return url
        except:
            pass

    # 2. Digipart check (aggregates DigiKey, Farnell, Mouser, OnlineComponents)
    try:
        url = f"https://www.digipart.com/part/{clean_encoded}"
        r = requests.get(url, headers=HEADERS, timeout=6)
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

    # 3. Direct Amphenol Photos on DigiKey
    for folder in ["Amphenol%20Photos", "Amphenol%20Commercial%20Products%20Photos"]:
        url = f"https://media.digikey.com/Photos/{folder}/{clean_encoded}.jpg"
        try:
            r = requests.head(url, headers=HEADERS, timeout=3, allow_redirects=True)
            if r.status_code == 200:
                return url
        except:
            pass

    return None

def download_image_for_product(product):
    sku = product['sku']
    cleaned = clean_part_number(sku)
    fname = safe_filename(cleaned) + ".jpg"
    dest_path = os.path.join(OUTPUT_DIR, fname)
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        return {"sku": sku, "status": "EXISTS", "file": fname}
    
    img_url = find_image_url(sku)
    if not img_url:
        return {"sku": sku, "status": "NOT_FOUND", "file": None}
    
    # Download the image
    try:
        r = requests.get(img_url, headers=HEADERS, timeout=10)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return {"sku": sku, "status": "DOWNLOADED", "file": fname, "bytes": len(r.content), "url": img_url}
        else:
            return {"sku": sku, "status": "DOWNLOAD_FAILED", "file": None}
    except Exception as e:
        return {"sku": sku, "status": f"ERROR: {e}", "file": None}

if __name__ == "__main__":
    # Load all Qualitech products
    with open('scripts/parsed_qualitech_products.json', 'r', encoding='utf-8') as f:
        prods = json.load(f)

    # Filter out custom photoshoot items (those starting with QT-HARN or QT-CA or already possessing photoshoot photos)
    stock_prods = [p for p in prods if not p['sku'].upper().startswith('QT-')]
    print(f"Total Qualitech stock products to process: {len(stock_prods)}")

    downloaded = 0
    already_exist = 0
    not_found = 0
    errors = 0

    print("Starting multi-threaded download (12 workers)...")
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(download_image_for_product, p): p for p in stock_prods}
        for future in as_completed(futures):
            res = future.result()
            st = res['status']
            sku = res['sku']
            if st == "DOWNLOADED":
                downloaded += 1
                print(f"[OK] Downloaded: {sku} -> {res['file']} ({res.get('bytes', 0)} bytes)")
            elif st == "EXISTS":
                already_exist += 1
            elif st == "NOT_FOUND":
                not_found += 1
            else:
                errors += 1

    print("\n" + "="*50)
    print("DOWNLOAD BATCH SUMMARY:")
    print(f"  Downloaded:    {downloaded}")
    print(f"  Already exist: {already_exist}")
    print(f"  Not found:     {not_found}")
    print(f"  Errors:        {errors}")
    print(f"  Total checked: {len(stock_prods)}")
    print(f"Images directory: {OUTPUT_DIR}")
    print("="*50)
