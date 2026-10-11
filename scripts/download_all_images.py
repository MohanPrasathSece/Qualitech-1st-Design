#!/usr/bin/env python3
"""
Qualitech Product Image Downloader
Downloads stock product images from distributor CDNs
with live progress bar, ETA, and summary report
"""

import os
import re
import sys
import json
import time
import urllib.parse
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# --- Config ---
OUTPUT_DIR = os.path.abspath("public/images/products/qualitech")
PRODUCTS_FILE = "scripts/parsed_qualitech_products.json"
WORKERS = 8
REQUEST_TIMEOUT = 6

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
}

DIGIKEY_FOLDERS = [
    "FCI%20Photos",
    "Amphenol%20Photos",
    "Amphenol%20Commercial%20Products%20Photos",
    "Amphenol%20Industrial%20Operations%20Photos",
]


# --- Progress Bar ---
class ProgressBar:
    def __init__(self, total):
        self.total = total
        self.done = 0
        self.downloaded = 0
        self.skipped = 0
        self.not_found = 0
        self.errors = 0
        self.total_bytes = 0
        self.start_time = time.time()
        self.lock = threading.Lock()
        self.last_sku = ""

    def update(self, status, size_bytes=0, sku=""):
        with self.lock:
            self.done += 1
            self.last_sku = sku
            if status == "DOWNLOADED":
                self.downloaded += 1
                self.total_bytes += size_bytes
            elif status == "EXISTS":
                self.skipped += 1
            elif status == "NOT_FOUND":
                self.not_found += 1
            else:
                self.errors += 1
            self._render()

    def _render(self):
        elapsed = time.time() - self.start_time
        pct = (self.done / self.total) * 100
        bar_len = 35
        filled = int(bar_len * self.done / self.total)
        bar = "#" * filled + "-" * (bar_len - filled)

        if self.done > 0:
            rate = self.done / elapsed
            remaining = (self.total - self.done) / rate
            eta_str = self._fmt_time(remaining)
        else:
            eta_str = "..."

        elapsed_str = self._fmt_time(elapsed)
        mb = self.total_bytes / (1024 * 1024)

        line = (
            f"\r  [{bar}] {pct:5.1f}% "
            f"({self.done}/{self.total}) "
            f"OK:{self.downloaded} SKIP:{self.skipped} MISS:{self.not_found} ERR:{self.errors} "
            f"| {mb:.1f}MB | {elapsed_str} | ETA {eta_str}   "
        )
        sys.stdout.write(line)
        sys.stdout.flush()

    def _fmt_time(self, secs):
        m, s = divmod(int(secs), 60)
        if m > 0:
            return f"{m}m{s:02d}s"
        return f"{s}s"

    def summary(self):
        elapsed = time.time() - self.start_time
        mb = self.total_bytes / (1024 * 1024)
        print("\n")
        print("=" * 58)
        print("  DOWNLOAD COMPLETE")
        print("=" * 58)
        print(f"  [OK] Downloaded:     {self.downloaded}")
        print(f"  [--] Already exist:  {self.skipped}")
        print(f"  [XX] Not found:      {self.not_found}")
        print(f"  [!!] Errors:         {self.errors}")
        print(f"  ----------------------------")
        print(f"  Total checked:       {self.total}")
        print(f"  Total downloaded:    {mb:.2f} MB")
        print(f"  Time taken:          {self._fmt_time(elapsed)}")
        print(f"  Output folder:       {OUTPUT_DIR}")
        print("=" * 58)


# --- Image Source Resolvers ---
def clean_pn(raw):
    return re.sub(r'\(.*?\)', '', raw).strip()

def safe_filename(pn):
    return re.sub(r'[^a-zA-Z0-9_\-\.]', '_', pn).strip('_')

def try_digikey_cdn(pn):
    encoded = urllib.parse.quote(pn)
    for folder in DIGIKEY_FOLDERS:
        for ext in ['.jpg', '.JPG']:
            url = f"https://media.digikey.com/Photos/{folder}/{encoded}{ext}"
            try:
                r = requests.head(url, headers=HEADERS, timeout=3, allow_redirects=True)
                if r.status_code == 200:
                    return url
            except:
                pass
    return None

def try_digipart(pn):
    try:
        url = f"https://www.digipart.com/part/{urllib.parse.quote(pn)}"
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        for img in soup.find_all('img'):
            src = img.get('src', '')
            sl = src.lower()
            if any(x in sl for x in ['digikey.com', 'farnell.com', 'mouser.com', 'onlinecomponents.com']):
                if not any(x in sl for x in ['pdf', 'arrow', 'logo', 'flag', 'icon', 'distr']):
                    return f"https:{src}" if src.startswith('//') else src
    except:
        pass
    return None

def find_image(sku):
    pn = clean_pn(sku)

    # 1) Direct DigiKey CDN
    url = try_digikey_cdn(pn)
    if url:
        return url

    # 2) Digipart aggregator
    url = try_digipart(pn)
    if url:
        return url

    # 3) Try without trailing LF suffix
    stripped = re.sub(r'(?:U?N?C?LF|TLF|RLF|GLF|ALF|E1LF)$', '', pn)
    if stripped != pn:
        url = try_digikey_cdn(stripped)
        if url:
            return url

    # 4) Try base part (before last hyphen)
    parts = pn.rsplit('-', 1)
    if len(parts) == 2 and len(parts[0]) > 4:
        url = try_digikey_cdn(parts[0])
        if url:
            return url

    return None

def download_one(product):
    sku = product['sku']
    pn = clean_pn(sku)
    fname = safe_filename(pn) + ".jpg"
    dest = os.path.join(OUTPUT_DIR, fname)

    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return {"sku": sku, "status": "EXISTS", "file": fname, "bytes": 0}

    img_url = find_image(sku)
    if not img_url:
        return {"sku": sku, "status": "NOT_FOUND", "file": None, "bytes": 0}

    try:
        r = requests.get(img_url, headers=HEADERS, timeout=10)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest, "wb") as f:
                f.write(r.content)
            return {"sku": sku, "status": "DOWNLOADED", "file": fname, "bytes": len(r.content), "url": img_url}
    except:
        pass

    return {"sku": sku, "status": "ERROR", "file": None, "bytes": 0}


# --- Main ---
def main():
    print()
    print("=" * 58)
    print("  Qualitech Stock Product Image Downloader")
    print("=" * 58)
    print()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.exists(PRODUCTS_FILE):
        print(f"  ERROR: Products file not found: {PRODUCTS_FILE}")
        print("         Run parse_products_summary.py first.")
        sys.exit(1)

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        all_prods = json.load(f)

    stock_prods = [p for p in all_prods if not p['sku'].upper().startswith('QT-')]
    print(f"  Total Qualitech products:  {len(all_prods)}")
    print(f"  Photoshoot items (skip):   {len(all_prods) - len(stock_prods)}")
    print(f"  Stock items to download:   {len(stock_prods)}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Workers: {WORKERS}")
    print()
    print("  Downloading...")
    print()

    progress = ProgressBar(len(stock_prods))

    results = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(download_one, p): p for p in stock_prods}
        for future in as_completed(futures):
            res = future.result()
            progress.update(res["status"], res.get("bytes", 0), res.get("sku", ""))
            results.append(res)

    progress.summary()

    # Save report
    report_path = os.path.join("scripts", "download_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            "downloaded": [r for r in results if r["status"] == "DOWNLOADED"],
            "not_found": [r["sku"] for r in results if r["status"] == "NOT_FOUND"],
            "errors": [r["sku"] for r in results if r["status"] == "ERROR"],
            "exists": [r["sku"] for r in results if r["status"] == "EXISTS"],
        }, f, indent=2)
    print(f"\n  Detailed report saved: {report_path}")


if __name__ == "__main__":
    main()
