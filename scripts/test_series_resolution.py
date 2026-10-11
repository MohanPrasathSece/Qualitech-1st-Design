import re
import urllib.parse
import urllib.request
import json
import requests
from bs4 import BeautifulSoup

def get_base_series(pn):
    # D-Sub patterns
    m = re.match(r'^(D[A-E][0-9]{2}[PS]|D[A-E]M[0-9]{2}[PS]|D[A-E]B[0-9]{2}[PS]|8655)', pn)
    if m:
        return f"{m.group(1)} D-Sub connector"
    
    # MIL circular
    if pn.startswith("D38999"):
        return "MIL-DTL-38999 circular connector"
        
    # Fiber patch cables
    if pn.startswith("SC-") or pn.startswith("LC-") or "OFC" in pn:
        return "Fiber optic patch cable SC LC"
        
    # Headers like 8613, 8614, 67096, 68000, 71918
    m2 = re.match(r'^(\d{5})', pn)
    if m2:
        return f"Amphenol FCI {m2.group(1)} connector header"
        
    # 101 series
    m3 = re.match(r'^(101\d{5})', pn)
    if m3:
        return f"Amphenol FCI {m3.group(1)} connector"
        
    return f"Amphenol FCI {pn} connector"

test_pns = [
    "86130142114345E1LF",
    "DA15S564TILF",
    "DEM09P032N",
    "67096-002LF",
    "D38999/20WJ35PN",
    "SC-SC-SM-SX-1M"
]

for p in test_pns:
    series = get_base_series(p)
    print(f"Part: {p:25s} -> Base Series: {series}")
    # Check if base series matches on DigiKey or Digipart
    # e.g., first 5 digits or series code
    m = re.match(r'^([A-Za-z0-9]{4,8})', p)
    if m:
        prefix = m.group(1)
        url = f"https://www.digipart.com/part/{urllib.parse.quote(prefix)}"
        try:
            r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=5)
            soup = BeautifulSoup(r.text, 'html.parser')
            imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
            imgs = [i for i in imgs if any(x in i.lower() for x in ['digikey.com', 'farnell.com', 'mouser.com', 'media', 'photos'])]
            imgs = [i for i in imgs if not any(x in i.lower() for x in ['pdf', 'arrow', 'logo', 'flag', 'icon', 'distr'])]
            print(f"  Prefix {prefix} on Digipart -> {len(imgs)} imgs found: {imgs[:1]}")
        except Exception as e:
            print(f"  Error: {e}")
