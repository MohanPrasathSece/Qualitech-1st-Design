import requests
from bs4 import BeautifulSoup
import urllib.parse
import json

sample_not_found = [
    "86130142114345E1LF",
    "DA15S564TILF",
    "DBM25P532N",
    "DEM09P032N",
    "DE09S064TILF",
    "67096-002LF",
    "76624-001LF",
    "D38999/20WJ35PN",
    "SC-SC-SM-SX-1M",
    "10131936-120ULF"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for p in sample_not_found:
    print(f"\n--- Testing Part: {p} ---")
    
    # 1. Test Digipart search
    try:
        url = f"https://www.digipart.com/part/{urllib.parse.quote(p)}"
        r = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        imgs = [i for i in imgs if not any(x in i.lower() for x in ['pdf', 'arrow', 'logo', 'flag', 'icon', 'distr'])]
        print(f"  Digipart: {len(imgs)} imgs -> {imgs[:2]}")
    except Exception as e:
        print(f"  Digipart error: {e}")

    # 2. Test Octopart search HTML
    try:
        url = f"https://octopart.com/search?q={urllib.parse.quote(p)}"
        r = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        imgs = [i for i in imgs if any(x in i.lower() for x in ['octopart', 'part', 'media', 'image'])]
        print(f"  Octopart: status {r.status_code}, imgs: {len(imgs)} -> {imgs[:2]}")
    except Exception as e:
        print(f"  Octopart error: {e}")

    # 3. Test LCSC HTML search
    try:
        url = f"https://www.lcsc.com/search?q={urllib.parse.quote(p)}"
        r = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        imgs = [i for i in imgs if 'product' in i.lower() or 'item' in i.lower()]
        print(f"  LCSC: status {r.status_code}, imgs: {len(imgs)} -> {imgs[:2]}")
    except Exception as e:
        print(f"  LCSC error: {e}")
